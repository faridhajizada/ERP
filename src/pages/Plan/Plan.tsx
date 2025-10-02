import React, { useState } from "react";
import type { MenuProps, TableProps } from "antd";
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Dropdown,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Popover,
  Select,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  ScheduleOutlined,
  CheckCircleFilled,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  LogoutOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import {
  useGetPlansQuery,
  useAddPlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  type PlanItem,
  type Status,
} from "./../../api/plansApi";
import "./Plan.css";

const VOLUME_OPTIONS: PlanItem["volumeDivision"][] = [
  "Bərabər Bölünmə",
  "Tarixi Məlumatlara Əsaslanan Bölgü",
  "Dəyişən Bölünmə",
];

const STATUS_COLORS: Record<Status, "success" | "error"> = {
  Aktiv: "success",
  Deaktiv: "error",
};

export default function Plan() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<React.Key[]>([]);
  const [volumeFilter, setVolumeFilter] = useState<React.Key[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [drawerSelected, setDrawerSelected] = useState<string[]>([]);

  const [colVisible, setColVisible] = useState({
    docNo: true,
    projectName: true,
    year: true,
    description: true,
    volumeDivision: true,
    status: true,
    actions: true,
  });
  const [colSearch, setColSearch] = useState("");
  const [lang, setLang] = useState<"az" | "en">("az");

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<PlanItem | null>(null);
  const [form] = Form.useForm<PlanItem>();

  const { data: list, isFetching } = useGetPlansQuery({
    page: current,
    limit: pageSize,
    search,
    status: statusFilter as string[],
    volume: [...(volumeFilter as string[]), ...drawerSelected],
  });

  const [addPlan] = useAddPlanMutation();
  const [updatePlan] = useUpdatePlanMutation();
  const [deletePlan] = useDeletePlanMutation();

  const handleCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpenModal(true);
  };

  const handleEdit = (record: PlanItem) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpenModal(true);
  };

  const handleDelete = async (id: string) => {
    await deletePlan(id).unwrap();
    message.success("Silindi");
  };

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updatePlan({ id: editing.id, ...values }).unwrap();
        message.success("Yeniləndi");
      } else {
        await addPlan(values as Omit<PlanItem, "id">).unwrap();
        message.success("Yaradıldı");
      }
      setOpenModal(false);
    } catch {
      console.error(Error);
    }
  };

  const confirmStatusChange = (record: PlanItem, next: Status) => {
    Modal.confirm({
      centered: true,
      icon: <ExclamationCircleOutlined />,
      title:
        next === "Deaktiv"
          ? "Planlamanı deaktiv etmək istədiyinizə əminsiniz?"
          : "Planlamanı aktiv etmək istədiyinizə əminsiniz?",
      okText: next === "Deaktiv" ? "Deaktiv et" : "Aktiv et",
      cancelText: "Ləğv et",
      okButtonProps: {
        type: "primary",
        style: { background: "#A76445", borderColor: "#A76445" },
      },
      onOk: async () => {
        await updatePlan({ id: record.id, status: next }).unwrap();
        message.success(next === "Deaktiv" ? "Deaktiv edildi" : "Aktiv edildi");
      },
    });
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter([]);
    setVolumeFilter([]);
    setDrawerSelected([]);
    setCurrent(1);
  };

  const rowMenu = (record: PlanItem): MenuProps => ({
    items: [
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "Düzəliş et",
        onClick: () => handleEdit(record),
      },
      { type: "divider" },
      record.status === "Aktiv"
        ? {
            key: "deactivate",
            icon: <CloseOutlined style={{ color: "#ff4d4f" }} />,
            label: <span style={{ color: "#ff4d4f" }}>Deaktiv et</span>,
            onClick: () => confirmStatusChange(record, "Deaktiv"),
          }
        : {
            key: "activate",
            icon: <CheckOutlined style={{ color: "#52c41a" }} />,
            label: <span style={{ color: "#52c41a" }}>Aktiv et</span>,
            onClick: () => confirmStatusChange(record, "Aktiv"),
          },
      {
        type: "divider",
      },
      {
        key: "delete",
        danger: true,
        icon: <DeleteOutlined />,
        label: (
          <Popconfirm
            title="Silmək istədiyinizə əminsiniz?"
            okText="Bəli"
            cancelText="Xeyr"
            onConfirm={() => handleDelete(record.id)}
          >
            Sil
          </Popconfirm>
        ),
      },
    ],
  });

  const langMenu: MenuProps = {
    selectedKeys: [lang],
    onClick: ({ key }) => setLang(key as "az" | "en"),
    items: [
      { key: "az", label: "Azərbaycan" },
      { key: "en", label: "English" },
    ],
  };

  const userCard = (
    <div style={{ padding: 4 }}>
      <Popconfirm
        title="Çıxış et"
        description="Hesabdan çıxmaq istəyirsiniz?"
        okText="Bəli"
        cancelText="Xeyr"
        onConfirm={() => {
          localStorage.clear();
          window.location.href = "/login";
          message.success("Çıxış edildi");
        }}
      >
        <Button danger type="default" icon={<LogoutOutlined />}>
          Çıxış et
        </Button>
      </Popconfirm>
    </div>
  );

  const columnDefs = [
    { key: "docNo", label: "Sənədin nömrəsi" },
    { key: "projectName", label: "Layihə adı" },
    { key: "year", label: "Planlamanın aid olduğu il" },
    { key: "description", label: "Təsvir" },
    { key: "volumeDivision", label: "Həcm bölünmə" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Əməliyyatlar" },
  ] as const;

  const columnSettings = (
    <div style={{ width: 260 }}>
      <Input
        allowClear
        placeholder="Axtarış edin"
        prefix={<SearchOutlined />}
        value={colSearch}
        onChange={(e) => setColSearch(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <div style={{ maxHeight: 300, overflow: "auto", paddingRight: 4 }}>
        {columnDefs
          .filter((c) =>
            c.label.toLowerCase().includes(colSearch.toLowerCase())
          )
          .map((c) => (
            <div key={c.key} style={{ padding: "6px 0" }}>
              <Checkbox
                checked={(colVisible as any)[c.key]}
                onChange={(e) =>
                  setColVisible((v) => ({ ...v, [c.key]: e.target.checked }))
                }
              >
                {c.label}
              </Checkbox>
            </div>
          ))}
      </div>
    </div>
  );

  const columns: TableProps<PlanItem>["columns"] = [
    colVisible.docNo && {
      title: "Sənədin nömrəsi",
      dataIndex: "docNo",
      sorter: (a, b) => a.docNo.localeCompare(b.docNo),
      ellipsis: true,
    },
    colVisible.projectName && {
      title: "Layihə adı",
      dataIndex: "projectName",
      sorter: (a, b) => a.projectName.localeCompare(b.projectName),
      ellipsis: true,
    },
    colVisible.year && {
      title: "Planlamanın aid olduğu il",
      dataIndex: "year",
      sorter: (a, b) => a.year - b.year,
      width: 320,
    },
    colVisible.description && {
      title: "Təsvir",
      dataIndex: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
      ellipsis: true,
    },
    colVisible.volumeDivision && {
      title: "Həcm bölünmə",
      dataIndex: "volumeDivision",
      filters: VOLUME_OPTIONS.map((v) => ({ text: v, value: v })),
      filteredValue: volumeFilter,
      onFilter: (value, record) => record.volumeDivision === value,
      sorter: (a, b) => a.volumeDivision.localeCompare(b.volumeDivision),
      ellipsis: true,
    },
    colVisible.status && {
      title: "Status",
      dataIndex: "status",
      filters: [
        { text: "Aktiv", value: "Aktiv" },
        { text: "Deaktiv", value: "Deaktiv" },
      ],
      filteredValue: statusFilter,
      onFilter: (value, record) => record.status === value,
      render: (val: Status) => (
        <Space>
          <Badge status={STATUS_COLORS[val]} />
          {val}
        </Space>
      ),
      width: 130,
    },
    colVisible.actions && {
      title: "",
      key: "actions",
      fixed: "right",
      width: 72,
      render: (_, record) => (
        <Dropdown trigger={["click"]} menu={rowMenu(record)}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ].filter(Boolean) as TableProps<PlanItem>["columns"];

  return (
    <>
      <Flex vertical gap={16} style={{ padding: "0 40px" }}>
        <Flex align="center" justify="space-between">
          <Space>
            <Button type="text" icon={<ArrowLeftOutlined />} />
            <Breadcrumb items={[{ title: "PLANLAMA", href: "#" }]} />
          </Space>

          <Typography.Title level={4} style={{ margin: 0 }}>
            <Space>
              <ScheduleOutlined />
              PLANLAMA
            </Space>
          </Typography.Title>

          <Space size={12}>
            <Popover trigger="click" placement="bottomRight" content={userCard}>
              <Button
                shape="round"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "20px",
                  borderRadius: "6px",
                }}
              >
                <CheckCircleFilled
                  style={{
                    color: "#1677ff",
                    position: "absolute",
                    top: "10%",
                    left: "0",
                  }}
                />
                <div style={{ lineHeight: 1 }}>
                  <div>Anar Abdullayev</div>
                  <Typography.Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                      display: "flex",
                      justifyContent: "end",
                    }}
                  >
                    Müşavir
                  </Typography.Text>
                </div>
              </Button>
            </Popover>
            <Dropdown menu={langMenu} trigger={["click"]}>
              <Dropdown menu={langMenu} trigger={["click"]}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<GlobalOutlined />}
                  rootClassName="btn-lang"
                />
              </Dropdown>
            </Dropdown>
          </Space>
        </Flex>

        <Flex align="center" justify="space-between" gap={10}>
          <Space>
            <Breadcrumb items={[{ title: "Podratçı şirkət üzrə planlama" }]} />
          </Space>
          <Space>
            <Input
              allowClear
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrent(1);
              }}
              placeholder="Axtarış edin"
              prefix={<SearchOutlined />}
              variant="outlined"
              style={{ width: 280 }}
            />
            <Popover
              placement="bottomLeft"
              trigger="click"
              content={columnSettings}
            >
              <Button icon={<SettingOutlined />}>Cədvəl tənzimləmələri</Button>
            </Popover>

            <Button icon={<ReloadOutlined />} onClick={resetFilters}>
              Filterləri təmizlə
            </Button>

            <Button
              style={{ background: "rgba(182, 95, 59, 1)", color: "white" }}
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Yeni planlama
            </Button>
          </Space>
        </Flex>

        <Card>
          <Table<PlanItem>
            rowKey="id"
            loading={isFetching}
            columns={columns}
            dataSource={list?.items ?? []}
            onChange={(p, filters) => {
              setStatusFilter((filters.status as React.Key[]) ?? []);
              setVolumeFilter((filters.volumeDivision as React.Key[]) ?? []);
              if (p.pageSize && p.pageSize !== pageSize)
                setPageSize(p.pageSize);
              if (p.current && p.current !== current) setCurrent(p.current);
            }}
            pagination={{
              current,
              pageSize,
              total: list?.total ?? 0,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50, 100],
              showQuickJumper: true,
              showTotal: (t) => `Total ${t} items`,
              onChange: (p, s) => {
                setCurrent(p);
                setPageSize(s);
              },
              className: "custom-pagination",
            }}
            scroll={{ x: 1000 }}
          />
        </Card>

        <Modal
          open={openModal}
          title={editing ? "Planlamanı redaktə et" : "Yeni planlama"}
          onCancel={() => setOpenModal(false)}
          onOk={onSave}
          okText={editing ? "Yenilə" : "Yarat"}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="docNo"
              label="Sənədin nömrəsi"
              rules={[
                { required: true, message: "Sənədin nömrəsini daxil edin" },
              ]}
            >
              <Input placeholder="1213213" />
            </Form.Item>
            <Form.Item
              name="projectName"
              label="Layihə adı"
              rules={[{ required: true, message: "Layihə adını daxil edin" }]}
            >
              <Input placeholder="Layihe1" />
            </Form.Item>
            <Form.Item
              name="year"
              label="Planlamanın aid olduğu il"
              rules={[{ required: true, message: "İli seçin" }]}
            >
              <Select
                options={[2023, 2024, 2025, 2026].map((y) => ({
                  label: y,
                  value: y,
                }))}
                placeholder="Seçin"
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Təsvir"
              rules={[{ required: true, message: "Təsviri daxil edin" }]}
            >
              <Input.TextArea rows={3} placeholder="Qısa təsvir" />
            </Form.Item>
            <Form.Item
              name="volumeDivision"
              label="Həcm bölünmə"
              rules={[{ required: true, message: "Həcm bölünməni seçin" }]}
            >
              <Select
                options={VOLUME_OPTIONS.map((v) => ({ label: v, value: v }))}
                placeholder="Seçin"
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Statusu seçin" }]}
            >
              <Select
                options={[
                  { label: "Aktiv", value: "Aktiv" },
                  { label: "Deaktiv", value: "Deaktiv" },
                ]}
                placeholder="Seçin"
              />
            </Form.Item>
          </Form>
        </Modal>
      </Flex>
    </>
  );
}
