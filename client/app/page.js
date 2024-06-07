"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAddress } from "@thirdweb-dev/react";
import {
  Avatar,
  Button,
  Input,
  message,
  Space,
  Table,
  Tag,
  Select,
  Switch
} from "antd";
import { SyncOutlined } from "@ant-design/icons";
import styles from "./page.module.css";

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
  const [showMyStreams, setShowMyStreams] = useState(true);
  const [searchFilter, setSearchFilter] = useState({
    type: "",
    token: "",
    searchInput: ""
  });
  const address = useAddress();
  const account = address?.toLowerCase();

  useEffect(() => {
    if (account) {
      getStreams();
      // sync streams every 30 seconds
      const intervalId = setInterval(getStreams, 30000);
      return () => clearInterval(intervalId);
    }
  }, [account, showMyStreams]);

  const getStreams = () => {
    setDataLoading(true);
    // update search filters based on type
    const { type, token, searchInput } = searchFilter;
    const filterObj = {};
    if (token) filterObj.token = token;
    if (type === "INCOMING") {
      filterObj.receiver = account;
    } else if (type === "OUTGOING") {
      filterObj.sender = account;
    } else if (type === "TERMINATED") {
      filterObj.flowRate = "0";
    }
    client
      .request(STREAMS_QUERY, {
        skip: 0,
        first: 100,
        orderBy: "createdAt",
        orderDirection: "desc",
        where: {
          and: [
            filterObj,
            ...(showMyStreams
              ? [{ or: [{ sender: account }, { receiver: account }] }]
              : []),
            ...(searchInput && [
              {
                or: [
                  { sender_contains_nocase: searchInput },
                  { receiver_contains_nocase: searchInput },
                  { token_contains_nocase: searchInput }
                ]
              }
            ])
          ]
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
  };

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
            <Avatar shape="circle" size="default" src={tokenData.icon} />
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
          {sender === account ? `${sender} (You)` : sender}
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
          {receiver === account ? `${receiver} (You)` : receiver}
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
        <>
          {
            showMyStreams ? (
              <Space>
                <Tag color={row.sender === account ? "blue" : "green"}>
                  {row.sender === account ? "OUTGOING" : "INCOMING"}
                </Tag>
                {row.flowRate === "0" && <Tag color="red">TERMINATED</Tag>}
              </Space>
            ) : (
              <Tag color={row.flowRate === "0" ? "red" : "blue"}>
                {
                  row.flowRate === "0" ? "TERMINATED" : "ACTIVE"
                }
              </Tag>
            )
          }
        </>
      )
    }
  ];

  return (
    <>
      {account ? (
        <div>
          {/* Streams Table Starts */}

          <Space>
            <label htmlFor="search">Token:</label>
            <Select
              defaultValue=""
              style={{ width: 120 }}
              value={searchFilter?.token || ""}
              onChange={(val) =>
                setSearchFilter({ ...searchFilter, token: val })
              }
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
              value={searchFilter?.type || ""}
              onChange={(val) =>
                setSearchFilter({ ...searchFilter, type: val })
              }
            >
              <Select.Option value="">All</Select.Option>
              <Select.Option value="INCOMING">
                <Tag color="green">INCOMING</Tag>
              </Select.Option>
              <Select.Option value="OUTGOING">
                <Tag color="blue">OUTGOING</Tag>
              </Select.Option>
              <Select.Option value="TERMINATED">
                <Tag color="red">TERMINATED</Tag>
              </Select.Option>
            </Select>
            <Input.Search
              placeholder="Search by address"
              value={searchFilter?.searchInput || ""}
              enterButton
              allowClear
              onSearch={getStreams}
              onChange={(e) =>
                setSearchFilter({
                  ...searchFilter,
                  searchInput: e.target.value
                })
              }
            />
            <Button type="primary" onClick={getStreams}>
              <SyncOutlined />
            </Button>
            {/* switch to show all or by me */}
            <label>
              Owned By:
            </label>
            <Select
              defaultValue="me"
              style={{ width: 130 }}
              value={showMyStreams ? "me" : "all"}
              onChange={(val) => setShowMyStreams(val === "me")}
            >
              <Select.Option value="all">All</Select.Option>
              <Select.Option value="me">Me</Select.Option>
            </Select>
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
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            textAlign: "center"
          }}
        >
          <h2>Welcome to Superfluid Dashboard</h2>
          <h2>
            View and manage your Superfluid streams with ease. Including
            in-house realtime notifications about your streams
          </h2>
          <h2>Connect your wallet to get started</h2>
        </div>
      )}
    </>
  );
};