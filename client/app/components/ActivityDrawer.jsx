import { useState, useEffect } from "react";
import { Drawer, Button, message, Avatar, List, Empty } from "antd";
import { useAddress } from "@thirdweb-dev/react";
import { HistoryOutlined, ExportOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  STREAM_ACTIVITIES_QUERY,
  subgraphClient as client,
  supportedTokens
} from "@/app/utils/index.js";
import { explorerUrl } from "../utils/constants";

dayjs.extend(relativeTime);

export default function ActivityDrawer() {
  const [activities, setActivities] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const account = useAddress();

  const getActivities = async () => {
    console.log("Getting activities...");
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
  }, []);

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
            itemLayout="horizontal"
            dataSource={activities}
            renderItem={(item) => {
              const tokenData = supportedTokens.find(
                (oneToken) => oneToken.address === item?.stream?.token
              ) || {
                icon: "",
                symbol: "Unknown"
              };
              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={tokenData?.icon} />}
                    title={item?.type}
                    description={item?.flowRate}
                  />
                  {/* add timestamp */}
                  <div>{dayjs(item?.timestamp * 1000).fromNow()}</div>
                  {/* external link */}
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
