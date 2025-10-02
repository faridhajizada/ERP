import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Flex, Alert } from "antd";
import { useLoginMutation } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const { Title } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    try {
      setErrorMsg(null);
      const result = await login(values).unwrap();

      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);

      navigate("/dashboard");
    } catch (err: unknown) {
      const backendMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Giriş zamanı gözlənilməz xəta baş verdi";
      setErrorMsg(backendMessage);
    }
  };

  return (
    <Flex vertical align="center" justify="center" className="login-container">
      <Title
        level={1}
        style={{ textAlign: "center", color: "white", marginBottom: 32 }}
      >
        GİRİŞ
      </Title>
      <Card className="login-card" variant="borderless">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label={<span style={{ color: "#fff" }}>İstifadəçi adı</span>}
            name="username"
            rules={[{ required: true, message: "İstifadəçi adını daxil edin" }]}
          >
            <Input placeholder="Daxil edin" size="large" />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "#fff" }}>Şifrə</span>}
            name="password"
            rules={[{ required: true, message: "Şifrəni daxil edin" }]}
          >
            <Input.Password placeholder="Daxil edin" size="large" />
          </Form.Item>

          {errorMsg && (
            <Alert
              message={errorMsg}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={isLoading}
              className="login-btn"
              disabled={
                !form.isFieldsTouched(true) ||
                form.getFieldsError().some(({ errors }) => errors.length)
              }
            >
              Giriş et
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Flex>
  );
};

export default Login;
