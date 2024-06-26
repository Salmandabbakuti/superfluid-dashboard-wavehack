import { useState, useEffect } from "react";
import { Drawer, Button, message, Avatar, List, Empty, Select } from "antd";
import { useAddress } from "@thirdweb-dev/react";
import { HistoryOutlined, ExportOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  STREAM_ACTIVITIES_QUERY,
  subgraphClient as client,
  supportedTokens,
  calculateFlowRateInTokenPerMonth,
  ellipsisAddress
} from "@/app/utils/index.js";
import { explorerUrl } from "../utils/constants";

dayjs.extend(relativeTime);

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
        first: 30,
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
              parseInt(flowRateInTokenPerMonth) < 0.01
                ? "<0.01"
                : parseInt(flowRateInTokenPerMonth).toFixed(2);

            let title = "";
            switch (item.type) {
              case "CREATE":
                title = "Stream Created";
                break;
              case "UPDATE":
                title = "Stream Updated";
                break;
              case "DELETE":
                title = "Stream Cancelled";
                break;
              default:
                title = "Unknown Activity";
            }

            let description = "";
            if (item?.flowRate > 0) {
              description = `${flowRatePerMonth} ${
                tokenData?.symbol
              }/mo opened from ${ellipsisAddress(
                item?.stream?.sender
              )} to ${ellipsisAddress(item?.stream?.receiver)}`;
            } else {
              description = `Stream from ${ellipsisAddress(
                item?.stream?.sender
              )} to ${ellipsisAddress(
                item?.stream?.receiver
              )} has been cancelled`;
            }

            return (
              <List.Item key={item?.id}>
                <List.Item.Meta
                  avatar={<Avatar src={tokenData?.icon} size="default" />}
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
