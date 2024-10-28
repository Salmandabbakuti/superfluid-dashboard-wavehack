"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Avatar,
  Button,
  Input,
  message,
  Space,
  Table,
  Tag,
  Select,
  Popover,
  List,
  Divider
} from "antd";
import { SyncOutlined, HistoryOutlined } from "@ant-design/icons";

import {
  supportedTokens,
  calculateFlowRateInTokenPerMonth,
  STREAMS_QUERY,
  subgraphClient as client
} from "./utils";

import { explorerUrl } from "./utils/constants";

dayjs.extend(relativeTime);

export default function Home() {
  const [streams, setStreams] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQueryParam = searchParams.get("q") || "";
  const tokenQueryParam = searchParams.get("token") || "";
  const typeQueryParam = searchParams.get("type") || "";
  const viewAsQueryParam = searchParams.get("view_as") || "";

  const getStreams = useCallback(() => {
    setDataLoading(true);

    // Update search filters based on type
    const filterObj = {};
    if (tokenQueryParam) filterObj.token = tokenQueryParam;
    if (typeQueryParam === "INCOMING") {
      filterObj.receiver = viewAsQueryParam?.toLowerCase();
    } else if (typeQueryParam === "OUTGOING") {
      filterObj.sender = viewAsQueryParam?.toLowerCase();
    } else if (typeQueryParam === "TERMINATED") {
      filterObj.flowRate = "0";
    } else if (typeQueryParam === "ACTIVE") {
      filterObj.flowRate_gt = "0";
    }

    const filters = [
      filterObj,
      ...(viewAsQueryParam
        ? [{ or: [{ sender: viewAsQueryParam?.toLowerCase() }, { receiver: viewAsQueryParam?.toLowerCase() }] }]
        : []),
      ...(searchQueryParam
        ? [
          {
            or: [
              { sender_contains_nocase: searchQueryParam },
              { receiver_contains_nocase: searchQueryParam },
              { token_contains_nocase: searchQueryParam }
            ]
          }
        ]
        : [])
    ];

    client
      .request(STREAMS_QUERY, {
        skip: 0,
        first: 100,
        orderBy: "createdAt",
        orderDirection: "desc",
        activites_skip: 0,
        activites_first: 20,
        activities_orderBy: "timestamp",
        activities_orderDirection: "desc",
        where: {
          and: filters
        }
      })
      .then((data) => {
        console.log("streams: ", data.streams);
        setStreams(data.streams);
        setDataLoading(false);
      })
      .catch((err) => {
        setDataLoading(false);
        message.error("Something went wrong. Is the Subgraph running?");
        console.error("failed to get streams: ", err);
      });
  }, [searchQueryParam, tokenQueryParam, typeQueryParam, viewAsQueryParam]);

  useEffect(() => {
    getStreams();
    // Sync streams every 30 seconds
    const intervalId = setInterval(getStreams, 30000);
    return () => clearInterval(intervalId);
  }, [getStreams]);

  const columns = [
    {
      title: "Asset",
      key: "token",
      width: "5%",
      render: ({ token }) => {
        const tokenData = supportedTokens.find(
          (oneToken) => oneToken.address === token
        ) || {
          icon: "",
          symbol: "Unknown"
        };
        return (
          <>
            <Avatar shape="circle" size="small" src={tokenData.icon} />
            <a
              href={`${explorerUrl}/token/${token}`}
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: 10 }}
            >
              {tokenData.symbol}
            </a>
          </>
        );
      }
    },
    {
      title: "Sender",
      key: "sender",
      ellipsis: true,
      width: "10%",
      render: ({ sender }) => (
        <a
          href={`${explorerUrl}/address/${sender}`}
          target="_blank"
          rel="noreferrer"
        >
          {sender === viewAsQueryParam?.toLowerCase() ? `${sender} (You)` : sender}
        </a>
      )
    },
    {
      title: "Receiver",
      key: "receiver",
      ellipsis: true,
      width: "10%",
      render: ({ receiver }) => (
        <a
          href={`${explorerUrl}/address/${receiver}`}
          target="_blank"
          rel="noreferrer"
        >
          {receiver === viewAsQueryParam?.toLowerCase() ? `${receiver} (You)` : receiver}
        </a>
      )
    },
    {
      title: "Flow Rate",
      key: "flowRate",
      sorter: (a, b) => a.flowRate - b.flowRate,
      width: "5%",
      render: ({ flowRate, token }) => {
        // calculate flow rate in supportedTokens per month
        const monthlyFlowRate = calculateFlowRateInTokenPerMonth(flowRate);
        const tokenSymbol =
          supportedTokens.find((oneToken) => oneToken.address === token)
            ?.symbol || "Unknown";
        return (
          <span style={{ color: "#1890ff" }}>
            {monthlyFlowRate} {tokenSymbol}/mo
          </span>
        );
      }
    },
    {
      title: "Created / Updated At",
      key: "createdAt",
      sorter: (a, b) => a.createdAt - b.createdAt,
      width: "5%",
      render: ({ createdAt, updatedAt }) => (
        <Space direction="vertical">
          <span>{dayjs(createdAt * 1000).format("DD MMM YYYY")}</span>
          <span>{dayjs(updatedAt * 1000).format("DD MMM YYYY")}</span>
        </Space>
      )
    },
    {
      title: "Remarks",
      width: "5%",
      render: (row) => (
        <Space>
          <Popover
            title={
              <>
                <strong>Stream Activity</strong>
                <Divider plain />
              </>
            }
            trigger="click"
            placement="left"
            overlayStyle={{ width: 380 }}
            arrow={{ pointAtCenter: true }}
            content={() => {
              const tokenData = supportedTokens.find(
                (oneToken) => oneToken.address === row.token
              ) || {
                icon: "",
                symbol: "Unknown"
              };
              return (
                <List
                  split={false}
                  header={
                    <Space direction="vertical" size={"small"}>
                      {/* show sender, receiver, token with links */}
                      <p>
                        <strong>Sender:</strong>{" "}
                        <a
                          href={`${explorerUrl}/address/${row?.sender}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {row?.sender?.slice(0, 8) + "..." + row?.sender?.slice(-8)}
                        </a>
                      </p>
                      <p>
                        <strong>Receiver:</strong>{" "}
                        <a
                          href={`${explorerUrl}/address/${row?.receiver}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {row?.receiver?.slice(0, 8) + "..." + row?.receiver?.slice(-8)}
                        </a>
                      </p>
                      <p>
                        <strong>Token:</strong>{" "}
                        <a
                          href={`${explorerUrl}/token/${row?.token}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Avatar shape="circle" size="small" src={tokenData?.icon} />{" "}
                          {tokenData?.symbol}
                        </a>
                      </p>
                    </Space>
                  }
                  size="large"
                  itemLayout="horizontal"
                  dataSource={row?.activities}
                  renderItem={(activity) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <>
                            <Divider plain>{dayjs(activity?.timestamp * 1000).format(
                              "MMM D, YYYY"
                            )}</Divider>
                            <Tag
                              color={
                                activity?.type === "CREATE"
                                  ? "blue"
                                  : activity?.type === "UPDATE"
                                    ? "yellow"
                                    : activity?.type === "DELETE"
                                      ? "red"
                                      : "default"
                              }
                            >
                              {activity?.type?.toUpperCase()}
                            </Tag>
                          </>
                        }
                        description={
                          <>
                            <p>
                              <strong>Transaction Hash: </strong>
                              <a
                                href={`${explorerUrl}/tx/${activity?.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {activity?.txHash?.slice(0, 8) + "..." + activity?.txHash?.slice(-8)}
                              </a>
                            </p>
                            <p>
                              <strong>Flow Rate: </strong> {calculateFlowRateInTokenPerMonth(activity?.flowRate)} {tokenData?.symbol}/mo
                            </p>
                            <p>
                              <strong>Timestamp: </strong>
                              {dayjs(activity?.timestamp * 1000).format(
                                "h:mm A MMM D, YYYY"
                              )}
                            </p>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              );
            }}
          >
            <Button icon={<HistoryOutlined />} type="text" shape="circle" />
          </Popover>
          {viewAsQueryParam ? (
            <Space>
              <Tag color={row.sender === viewAsQueryParam?.toLowerCase() ? "blue" : "green"}>
                {row.sender === viewAsQueryParam?.toLowerCase() ? "OUTGOING" : "INCOMING"}
              </Tag>
              {row.flowRate === "0" && <Tag color="red">TERMINATED</Tag>}
            </Space>
          ) : (
            <Tag color={row.flowRate === "0" ? "red" : "blue"}>
              {row.flowRate === "0" ? "TERMINATED" : "ACTIVE"}
            </Tag>
          )}
        </Space>
      )
    }
  ];

  return (
    <>
      {/* Streams Table Starts */}
      <Space>
        <label htmlFor="search">Token:</label>
        <Select
          defaultValue=""
          style={{ width: 120 }}
          value={tokenQueryParam}
          onChange={(val) => {
            const urlSearchParams = new URLSearchParams(window.location.search);
            if (val) urlSearchParams.set("token", val);
            else urlSearchParams.delete("token");
            router.push(`/?${urlSearchParams.toString()}`);
          }}
        >
          <Select.Option value="">All</Select.Option>
          {supportedTokens.map((token, i) => (
            <Select.Option value={token.address} key={i}>
              <Avatar shape="circle" size="small" src={token.icon} />{" "}
              {token.symbol}
            </Select.Option>
          ))}
        </Select>
        <label htmlFor="search">Stream Type:</label>
        <Select
          defaultValue=""
          style={{ width: 120 }}
          value={typeQueryParam}
          onChange={(val) => {
            const urlSearchParams = new URLSearchParams(window.location.search);
            if (val) urlSearchParams.set("type", val);
            else urlSearchParams.delete("type");
            router.push(`/?${urlSearchParams.toString()}`);
          }}
        >
          <Select.Option value="">All</Select.Option>
          <Select.Option value="INCOMING" disabled={!viewAsQueryParam}>
            <Tag color="green">INCOMING</Tag>
          </Select.Option>
          <Select.Option value="OUTGOING" disabled={!viewAsQueryParam}>
            <Tag color="blue">OUTGOING</Tag>
          </Select.Option>
          <Select.Option value="ACTIVE">
            <Tag color="blue">ACTIVE</Tag>
          </Select.Option>
          <Select.Option value="TERMINATED">
            <Tag color="red">TERMINATED</Tag>
          </Select.Option>
        </Select>
        <Input.Search
          placeholder="Search by address"
          value={searchQueryParam}
          enterButton
          allowClear
          onSearch={getStreams}
          onChange={(e) => {
            const urlSearchParams = new URLSearchParams(window.location.search);
            if (e.target.value) urlSearchParams.set("q", e.target.value);
            else urlSearchParams.delete("q");
            router.push(`/?${urlSearchParams.toString()}`);
          }
          }
        />
        <Button
          type="primary"
          shape="circle"
          onClick={getStreams}
        >
          <SyncOutlined />
        </Button>
      </Space>
      <Table
        className="table_grid"
        columns={columns}
        rowKey="id"
        dataSource={streams}
        scroll={{ x: 970 }}
        loading={dataLoading}
        pagination={{
          pageSizeOptions: [5, 10, 20, 25, 50, 100],
          showSizeChanger: true,
          showQuickJumper: true,
          defaultCurrent: 1,
          defaultPageSize: 10,
          size: "small"
        }}
      />
      {/* Streams Table Ends */}
    </>
  );
}
