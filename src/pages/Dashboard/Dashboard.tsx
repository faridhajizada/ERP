import React from "react";
import { Card, Typography, Flex } from "antd";
import { ScheduleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <Flex justify="space-between" align="center" className="dashboard-inner">
        <Flex vertical gap={14}>
          <Card
            className="dashboard-card"
            onClick={() => navigate("/dashboard/plan")}
          >
            <Flex vertical align="center" justify="center">
              <ScheduleOutlined style={{ fontSize: 50, color: "white" }} />
              <Text style={{ color: "white", marginTop: 12, fontSize: "20px" }}>
                PLANLAMA
              </Text>
            </Flex>
          </Card>
        </Flex>

        <div className="dashboard-title">
          <Title
            style={{
              color: "white",
              fontWeight: "bold",
              marginBottom: 8,
              fontSize: "80px",
            }}
          >
            DAĞ-MƏDƏN
          </Title>
          <Text style={{ color: "#e6e6a8", fontSize: "24px" }}>
            Əməliyyatlarına Nezarət və İdarəetmə Mərkəzi
          </Text>
        </div>
      </Flex>
    </div>
  );
};

export default Dashboard;
