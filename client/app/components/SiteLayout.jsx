"use client";
import { Divider, Layout, Input } from "antd";
import { ArrowRightOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import ActivityDrawer from "./ActivityDrawer";
import { ellipsisAddress } from "../utils";
import "antd/dist/reset.css";

const { Header, Footer, Content } = Layout;

export default function SiteLayout({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewAsQueryParam = searchParams.get("view_as") || "";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 99,
          padding: 0,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "5px"
        }}
      >
        <h3
          style={{
            margin: 0,
            padding: "0 6px",
            fontWeight: "bold"
          }}
        >
          Superfluid Dashboard
        </h3>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* view as input box with arrow */}
          <label style={{ color: "white", marginRight: 12 }}>View as: </label>
          <Input
            placeholder="Enter address e.g. 0x1234..."
            value={viewAsQueryParam ? ellipsisAddress(viewAsQueryParam) : ""}
            allowClear
            prefix={<UserOutlined />}
            style={{ width: 200 }}
            onChange={(e) => {
              console.log(e.target.value);
              const urlSearchParams = new URLSearchParams(
                window.location.search
              );
              if (e.target.value)
                urlSearchParams.set("view_as", e.target.value);
              else urlSearchParams.delete("view_as");
              router.push(`/?${urlSearchParams.toString()}`);
            }}
          />
          <ActivityDrawer />
        </div>
      </Header>

      <Content
        style={{
          margin: "12px 8px",
          padding: 12,
          minHeight: "100%",
          color: "black",
          maxHeight: "100%"
        }}
      >
        {children}
      </Content>
      <Divider plain />
      <Footer style={{ textAlign: "center" }}>
        <a
          href="https://github.com/Salmandabbakuti"
          target="_blank"
          rel="noopener noreferrer"
        >
          ©{new Date().getFullYear()} Salman Dabbakuti. Powered by TheGraph &
          Superfluid
        </a>
        <p style={{ fontSize: "12px" }}>v0.0.1</p>
      </Footer>
    </Layout>
  );
}
