import { useState, useEffect } from "react";
import { Drawer, Button, message, Avatar, List, Select } from "antd";
import { useAddress } from "@thirdweb-dev/react";
import {
  HistoryOutlined,
  ExportOutlined,
  SyncOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import {
  STREAM_ACTIVITIES_QUERY,
  subgraphClient as client,
  supportedTokens,
  calculateFlowRateInTokenPerMonth,
  ellipsisAddress
} from "@/app/utils/index.js";
import { explorerUrl } from "../utils/constants";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "now",
    m: "1m",
    mm: "%dm",
    h: "1hr",
    hh: "%dhr",
    d: "1d",
    dd: "%dd",
    M: "1mo",
    MM: "%dmo",
    y: "1yr",
    yy: "%dyr"
  }
});

export default function ActivityDrawer() {
  const [activities, setActivities] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showMyActivities, setShowMyActivities] = useState(false);
  const [loading, setLoading] = useState(false);

  const account = useAddress()?.toLowerCase();

  const getActivities = async () => {
    console.log("Getting activities...");
    console.log("account: ", account);
    setLoading(true);
    // if showMyActivities is true, filter by account, it would also show all activities if account is not connected
    const accountFilter = showMyActivities ? account : undefined;
    client
      .request(STREAM_ACTIVITIES_QUERY, {
        skip: 0,
        first: 100,
        orderBy: "timestamp",
        orderDirection: "desc",
        where: {
          stream_: {
            or: [{ sender: accountFilter }, { receiver: accountFilter }]
          }
        }
      })
      .then((data) => {
        console.log("activities: ", data.streamActivities);
        setActivities(data.streamActivities);
        setLoading(false);
      })
      .catch((error) => {
        message.error("Failed to get activity info...");
        console.error("Error fetching activities: ", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    getActivities();
  }, [account, showMyActivities]);

  return (
    <>
      <Button
        size="large"
        type="text"
        onClick={() => setIsOpen(true)}
        icon={<HistoryOutlined style={{ color: "#fff", fontWeight: "bold" }} />}
      />
      <Drawer
        title="Activity"
        placement="right"
        closable={true}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        width={550}
      >
        {/* add drop down to filter All or Owned by Me */}
        <label style={{ marginRight: 10 }}>Activity by: </label>
        <Select
          defaultValue={false}
          style={{ width: 120, right: 0, marginBottom: 10 }}
          onChange={(val) => setShowMyActivities(val)}
        >
          <Select.Option value={false}>All</Select.Option>
          <Select.Option value={true} disabled={!account}>
            Me
          </Select.Option>
        </Select>
        <Button
          type="primary"
          shape="circle"
          style={{ marginLeft: 10 }}
          onClick={getActivities}
          icon={<SyncOutlined spin={loading} />}
        />
        <List
          size="small"
          itemLayout="horizontal"
          dataSource={activities}
          loading={loading}
          pagination={{
            size: "small",
            position: "bottom",
            align: "end",
            pageSize: 10
          }}
          renderItem={(item) => {
            const tokenData = supportedTokens.find(
              (oneToken) => oneToken.address === item?.stream?.token
            ) || {
              icon: "",
              symbol: "Unknown"
            };

            const flowRateInTokenPerMonth = calculateFlowRateInTokenPerMonth(
              item?.flowRate
            );

            // if flowRateInTokenPerMonth is less than 0.01, show <0.01 else show the value with 2 decimal places
            const flowRatePerMonth =
              parseFloat(flowRateInTokenPerMonth) < 0.01
                ? "<0.01"
                : parseFloat(flowRateInTokenPerMonth).toFixed(2);

            let title = "";
            let description = "";
            switch (item.type) {
              case "CREATE":
                title = "Stream Created";
                description = `${flowRatePerMonth} ${
                  tokenData?.symbol
                }/mo stream opened from ${ellipsisAddress(
                  item?.stream?.sender
                )} to ${ellipsisAddress(item?.stream?.receiver)}`;
                break;
              case "UPDATE":
                title = "Stream Updated";
                description = `${
                  tokenData?.symbol
                } Stream from ${ellipsisAddress(
                  item?.stream?.sender
                )} to ${ellipsisAddress(
                  item?.stream?.receiver
                )} is updated to ${flowRatePerMonth} ${tokenData?.symbol}/mo`;
                break;
              case "DELETE":
                title = "Stream Cancelled";
                description = `${
                  tokenData?.symbol
                } Stream from ${ellipsisAddress(
                  item?.stream?.sender
                )} to ${ellipsisAddress(item?.stream?.receiver)} is cancelled`;
                break;
              default:
                title = "Unknown Activity";
                description = "No information available";
            }

            return (
              <List.Item key={item?.id}>
                <List.Item.Meta
                  avatar={<Avatar src={tokenData?.icon} size="small" />}
                  title={title}
                  description={description}
                />
                <div>{dayjs(item?.timestamp * 1000).fromNow(true)}</div>
                <Button
                  icon={<ExportOutlined />}
                  type="link"
                  href={`${explorerUrl}/tx/${item?.txHash}`}
                  target="_blank"
                />
              </List.Item>
            );
          }}
        />
      </Drawer>
    </>
  );
}
