import { useState, useEffect } from "react";
import { Drawer, Button, message, Avatar, List, Empty } from "antd";
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

  const account = useAddress();

  const getActivities = async () => {
    console.log("Getting activities...");
    console.log("account: ", account);
    client
      .request(STREAM_ACTIVITIES_QUERY, {
        skip: 0,
        first: 30,
        orderBy: "timestamp",
        orderDirection: "desc",
        where: {
          stream_: {
            or: [{ sender: account }, { receiver: account }]
          }
        }
      })
      .then((data) => {
        console.log("activities: ", data.streamActivities);
        setActivities(data.streamActivities);
      })
      .catch((error) => {
        message.error("Failed to get activity info...");
        console.error("Error fetching activities: ", error);
      });
  };

  useEffect(() => {
    getActivities();
  }, [account]);

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
        width={400}
      >
        {activities.length > 0 ? (
          <List
            size="small"
            itemLayout="horizontal"
            dataSource={activities}
            pagination={{
              size: "small",
              position: "bottom",
              align: "center",
              pageSize: 10
            }}
            renderItem={(item) => {
              const tokenData = supportedTokens.find(
                (oneToken) => oneToken.address === item?.stream?.token
              ) || {
                icon: "",
                symbol: "Unknown"
              };

              const flowRatePerMonth = calculateFlowRateInTokenPerMonth(
                item?.flowRate
              );

              let title = "";
              switch (item.type) {
                case "CREATE":
                  title = "Stream Created";
                  break;
                case "UPDATE":
                  title = "Stream Updated";
                  break;
                case "DELETE":
                  title = "Stream Deleted";
                  break;
                default:
                  title = "Unknown Activity";
              }

              let description = "";
              if (item?.flowRate > 0) {
                description = `${flowRatePerMonth} ${
                  tokenData?.symbol
                }/mo sent from ${ellipsisAddress(
                  item?.stream?.sender
                )} to ${ellipsisAddress(item?.stream?.receiver)}`;
              } else {
                description = `Stream from ${ellipsisAddress(
                  item?.stream?.sender
                )} to ${ellipsisAddress(
                  item?.stream?.receiver
                )} has been deleted`;
              }

              return (
                <List.Item key={item?.id}>
                  <List.Item.Meta
                    avatar={<Avatar src={tokenData?.icon} />}
                    title={title}
                    description={description}
                  />
                  <div>{dayjs(item?.timestamp * 1000).fromNow()}</div>
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
        ) : (
          <Empty description="No activities found" />
        )}
      </Drawer>
    </>
  );
}
