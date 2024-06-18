import { formatEther } from "@ethersproject/units";
import { GraphQLClient, gql } from "graphql-request";
import {
  subgraphUrl,
  fDAIxAddress,
  fUSDCxAddress,
  DEGENtxAddress,
  MATICxAddress,
  ETHxAddress,
  FUNDxAddress,
  GHOxAddress
} from "./constants";

export const supportedTokens = [
  {
    name: "fDAIx",
    symbol: "fDAIx",
    address: fDAIxAddress,
    icon: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/dai/icon.svg"
  },
  {
    name: "fUSDCx",
    symbol: "fUSDCx",
    address: fUSDCxAddress,
    icon: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/usdc/icon.svg"
  },
  {
    name: "DEGENtx",
    symbol: "DEGENtx",
    address: DEGENtxAddress,
    icon: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/tusd/icon.svg"
  },
  {
    name: "MATICx",
    symbol: "MATICx",
    address: MATICxAddress,
    icon: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/matic/icon.svg"
  },
  {
    name: "ETHx",
    symbol: "ETHx",
    address: ETHxAddress,
    icon: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/eth/icon.svg"
  },
  {
    name: "FUNDx",
    symbol: "FUNDx",
    address: FUNDxAddress,
    icon: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/fund/icon.svg"
  },
  {
    name: "GHOx",
    symbol: "GHOx",
    address: GHOxAddress,
    icon: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/gho/icon.svg"
  }
];

export const ellipsisAddress = (address) => address.slice(0, 4) + "..." + address.slice(-2);

export const calculateFlowRateInTokenPerMonth = (amount) => {
  if (isNaN(amount)) return 0;
  // convert from wei/sec to token/month for displaying in UI
  // 2628000 = 1 month in seconds(sf recommendation)
  const flowRate = (formatEther(amount) * 2628000).toFixed(9);
  // if flowRate is floating point number, remove unncessary trailing zeros
  return flowRate.replace(/\.?0+$/, "");
};

export const STREAMS_QUERY = gql`
  query getStreams(
    $skip: Int
    $first: Int
    $orderBy: Stream_orderBy
    $orderDirection: OrderDirection
    $where: Stream_filter
  ) {
    streams(
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      sender
      receiver
      token
      activities {
        id
        type
        flowRate
        txHash
        timestamp
      }
      flowRate
      createdAt
      updatedAt
    }
  }
`;

export const STREAM_ACTIVITIES_QUERY = gql`
  query getStreamActivities(
    $skip: Int
    $first: Int
    $orderBy: StreamActivity_orderBy
    $orderDirection: OrderDirection
    $where: StreamActivity_filter
  ) {
    streamActivities(
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      type
      flowRate
      txHash
      timestamp
      stream {
        id
        sender
        receiver
        token
        createdAt
        updatedAt
      }
    }
  }
`;

export const subgraphClient = new GraphQLClient(subgraphUrl);
