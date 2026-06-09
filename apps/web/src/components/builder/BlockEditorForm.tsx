import React, { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Camera, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { createClient } from "@/utils/supabase/client";

const AutoResizeTextarea = React.memo(
  ({ className, value, onChange, ...props }: any) => {
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (ref.current) {
        ref.current.style.height = "auto";
        ref.current.style.height = `${ref.current.scrollHeight}px`;
      }
    }, [value]);

    return (
      <textarea
        ref={ref}
        className={`${className} resize-none overflow-hidden`}
        value={value}
        onChange={(e) => {
          onChange(e);
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        rows={1}
        {...props}
      />
    );
  },
);

const InputField = React.memo(
  ({ label, value, path, type = "text", handleChange }: any) => {
    useEffect(() => {
      console.log("INPUT MOUNT");
    }, []);
    return (
      <div className="mb-3">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
          {label}
        </label>
        {type === "textarea" ? (
          <AutoResizeTextarea
            className="w-full p-2 text-xs border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors min-h-20"
            value={value || ""}
            onChange={(e: any) => handleChange(path, e.target.value)}
          />
        ) : (
          <input
            type="text"
            className="w-full p-2 text-xs border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors"
            value={value || ""}
            onChange={(e) => handleChange(path, e.target.value)}
          />
        )}
      </div>
    );
  },
);

interface BlockEditorFormProps {
  activeBlock: string;
  data: any;
  onChange: (newData: any) => void;
  sectionTitle?: string;
  onTitleChange?: (newTitle: string) => void;
  docType?: "cv" | "cover_letter";
  onAvatarUpload?: (url: string) => void;
}

export function BlockEditorForm({
  activeBlock,
  data,
  onChange,
  sectionTitle,
  onTitleChange,
  docType,
  onAvatarUpload,
}: BlockEditorFormProps) {
  const { t } = useTranslation();
  const supabase = createClient();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  // Use local state to handle fast typing, then debounce or flush to parent on blur/save
  const [localData, setLocalData] = useState<any>(data);
  const localDataRef = useRef<any>(data);

  useEffect(() => {
    setLocalData(data);
    localDataRef.current = data;
  }, [activeBlock]);

  // Keep ref in sync whenever localData changes
  useEffect(() => {
    localDataRef.current = localData;
  }, [localData]);

  const handleChange = (path: string[], value: any) => {
    const newData = structuredClone(localData);

    if (path.length === 0) {
      setLocalData(value);
      onChange(value);
      return;
    }

    let current: any = newData;

    for (let i = 0; i < path.length - 1; i++) {
      const key = /^\d+$/.test(path[i]) ? Number(path[i]) : path[i];

      current = current[key];
    }

    const lastKey = /^\d+$/.test(path[path.length - 1])
      ? Number(path[path.length - 1])
      : path[path.length - 1];

    current[lastKey] = value;

    setLocalData(newData);
    onChange(newData);
  };

  const StringArrayField = ({ label, items, path }: any) => {
    const arrayItems = Array.isArray(items)
      ? items
      : typeof items === "string"
        ? [items]
        : [];

    return (
      <div className="mb-3">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
          {label}
        </label>
        {arrayItems.map((item: string, idx: number) => (
          <div key={idx} className="flex gap-1 mb-1.5">
            <AutoResizeTextarea
              className="flex-1 p-2 text-xs border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors min-h-10"
              value={item || ""}
              onChange={(e: any) =>
                handleChange([...path, idx.toString()], e.target.value)
              }
            />
            <button
              onClick={() => {
                const newItems = [...arrayItems];
                newItems.splice(idx, 1);
                handleChange(path, newItems);
              }}
              className="p-2 border border-zinc-200 hover:bg-red-50 text-red-400 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          onClick={() => handleChange(path, [...arrayItems, ""])}
          className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black flex items-center gap-1 mt-1"
        >
          <div className="w-4 h-4 bg-zinc-100 rounded flex items-center justify-center">
            +
          </div>{" "}
          {t("builder.add") || "Thêm"}
        </button>
      </div>
    );
  };

  const LinkArrayField = ({ label, items, path }: any) => (
    <div className="mb-3">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
        {label}
      </label>
      {(items || []).map((item: any, idx: number) => (
        <div key={idx} className="flex gap-1 mb-1.5 items-start">
          <div className="flex-1 space-y-1">
            <input
              type="text"
              placeholder={t("builder.linkName") || "Tên (VD: GitHub)"}
              className="w-full p-2 text-xs border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors"
              value={item.name || ""}
              onChange={(e) =>
                handleChange([...path, idx.toString(), "name"], e.target.value)
              }
            />
            <input
              type="text"
              placeholder={
                t("builder.linkUrl") || "URL (VD: https://github.com/...)"
              }
              className="w-full p-2 text-xs border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors"
              value={item.url || ""}
              onChange={(e) =>
                handleChange([...path, idx.toString(), "url"], e.target.value)
              }
            />
          </div>
          <button
            onClick={() => {
              const newItems = [...items];
              newItems.splice(idx, 1);
              handleChange(path, newItems);
            }}
            className="p-2 border border-zinc-200 hover:bg-red-50 text-red-400 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button
        onClick={() => {
          const newItems = [...(items || []), { name: "", url: "" }];
          handleChange(path, newItems);
        }}
        className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border border-zinc-200 px-3 py-1.5 hover:bg-black hover:text-white hover:border-black transition-colors flex items-center gap-1 mt-1"
      >
        <Plus className="w-3 h-3" /> {t("builder.addLink") || "Thêm liên kết"}
      </button>
    </div>
  );

  const TitleEditor = () => {
    if (
      onTitleChange === undefined ||
      activeBlock === "personal" ||
      activeBlock === "recipient"
    )
      return null;
    return (
      <div className="mb-6 pb-4 border-b border-zinc-200">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-800 mb-1">
          {t("builder.sectionTitleLabel") || "Tiêu đề khối hiển thị trên CV"}
        </label>
        <input
          type="text"
          className="w-full p-2 text-xs border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors font-bold"
          value={sectionTitle || ""}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={
            t("builder.sectionTitlePlaceholder") || "VD: Kinh nghiệm làm việc"
          }
        />
      </div>
    );
  };

  // -- SPECIFIC RENDERERS --

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
      // Update local preview immediately
      const updated = { ...localDataRef.current, avatar: urlData.publicUrl };
      setLocalData(updated);
      // Notify parent directly via dedicated callback (bypasses activeBlock check)
      if (onAvatarUpload) {
        onAvatarUpload(urlData.publicUrl);
      } else {
        onChange(updated);
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  if (activeBlock === "personal") {
    const avatarUrl = localData?.avatar;
    return (
      <div className="space-y-1">
        {/* Avatar Upload UI */}
        <div className="mb-4">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
            {t("builder.avatar") || "Ảnh đại diện"}
          </label>
          <div className="flex items-center gap-3">
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="w-16 h-20 rounded border border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center cursor-pointer hover:border-zinc-500 transition-colors overflow-hidden relative group shrink-0"
            >
              {avatarUrl ? (
                <>
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  {isUploadingAvatar ? (
                    <svg
                      className="animate-spin h-5 w-5 text-zinc-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <Camera className="w-5 h-5 text-zinc-300" />
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 border border-zinc-200 hover:bg-zinc-100 transition-colors disabled:opacity-50"
              >
                {isUploadingAvatar
                  ? t("builder.processing") || "Đang tải..."
                  : avatarUrl
                    ? t("builder.changeAvatar") || "Đổi ảnh"
                    : t("builder.uploadAvatar") || "Tải ảnh lên"}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => handleChange(["avatar"], "")}
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 border border-zinc-200 text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />{" "}
                  {t("builder.removeAvatar") || "Xóa ảnh"}
                </button>
              )}
            </div>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        {/* Show Avatar toggle (Cover Letter only) */}
        {docType === "cover_letter" && (
          <div className="mb-3 p-3 bg-zinc-50 border border-zinc-200 rounded">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={localData?.showAvatar !== false}
                onChange={(e) => handleChange(["showAvatar"], e.target.checked)}
                className="w-4 h-4 rounded text-primary border-zinc-300 focus:ring-primary"
              />
              <span className="text-xs font-semibold text-zinc-700">
                {t("builder.showAvatarOnCL") ||
                  "Hiển thị ảnh đại diện trên Cover Letter"}
              </span>
            </label>
          </div>
        )}
        <InputField
          handleChange={handleChange}
          label={t("builder.fullName") || "Họ và Tên"}
          value={localData?.fullName}
          path={["fullName"]}
        />
        <InputField
          handleChange={handleChange}
          label={t("builder.jobTitle") || "Vị trí / Chức danh"}
          value={localData?.jobTitle}
          path={["jobTitle"]}
        />
        <div className="grid grid-cols-2 gap-2">
          <InputField
            handleChange={handleChange}
            label={t("builder.dob") || "Ngày sinh"}
            value={localData?.dob}
            path={["dob"]}
          />
          <InputField
            handleChange={handleChange}
            label={t("builder.gender") || "Giới tính"}
            value={localData?.gender}
            path={["gender"]}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField
            handleChange={handleChange}
            label={t("builder.email") || "Email"}
            value={localData?.email}
            path={["email"]}
          />
          <InputField
            handleChange={handleChange}
            label={t("builder.phone") || "Số điện thoại"}
            value={localData?.phone}
            path={["phone"]}
          />
        </div>
        <InputField
          handleChange={handleChange}
          label={t("builder.address") || "Địa chỉ"}
          value={localData?.location}
          path={["location"]}
        />
        <InputField
          handleChange={handleChange}
          label={t("builder.portfolio") || "Portfolio"}
          value={localData?.portfolio}
          path={["portfolio"]}
        />
        <LinkArrayField
          label={t("builder.links") || "Các liên kết khác"}
          items={localData?.links}
          path={["links"]}
        />
      </div>
    );
  }

  if (activeBlock === "summary") {
    return (
      <>
        <TitleEditor />
        <InputField
          handleChange={handleChange}
          label={t("builder.summary") || "Tóm tắt mục tiêu (Summary)"}
          value={localData}
          path={[]}
          type="textarea"
        />
      </>
    );
  }

  // Cover letter specific
  if (activeBlock === "recipient") {
    return (
      <div className="space-y-1">
        <InputField
          handleChange={handleChange}
          label={t("builder.recipientName") || "Tên người nhận"}
          value={localData?.name}
          path={["name"]}
        />
        <InputField
          handleChange={handleChange}
          label={t("builder.position") || "Chức vụ"}
          value={localData?.title}
          path={["title"]}
        />
        <InputField
          handleChange={handleChange}
          label={t("builder.company") || "Công ty"}
          value={localData?.company}
          path={["company"]}
        />
        <InputField
          handleChange={handleChange}
          label={t("builder.address") || "Địa chỉ"}
          value={localData?.address}
          path={["address"]}
        />
      </div>
    );
  }

  if (activeBlock === "salutation")
    return (
      <InputField
        handleChange={handleChange}
        label={t("builder.salutation") || "Lời chào"}
        value={localData}
        path={[]}
      />
    );
  if (activeBlock === "date")
    return (
      <InputField
        handleChange={handleChange}
        label={t("builder.date") || "Ngày tháng"}
        value={localData}
        path={[]}
      />
    );
  if (activeBlock === "signOff")
    return (
      <InputField
        handleChange={handleChange}
        label={t("builder.signOff") || "Chữ ký / Lời kết"}
        value={localData}
        path={[]}
        type="textarea"
      />
    );

  if (activeBlock === "body") {
    return (
      <div className="space-y-2">
        <InputField
          handleChange={handleChange}
          label={t("builder.opening") || "Mở đầu (Opening)"}
          value={localData?.opening}
          path={["opening"]}
          type="textarea"
        />
        <StringArrayField
          label={t("builder.bodyParagraphs") || "Các đoạn nội dung chính"}
          items={localData?.bodyParagraphs}
          path={["bodyParagraphs"]}
        />
        <InputField
          handleChange={handleChange}
          label={t("builder.closing") || "Kết luận (Closing)"}
          value={localData?.closing}
          path={["closing"]}
          type="textarea"
        />
      </div>
    );
  }

  // Hobbies is an array of strings, handle explicitly
  if (activeBlock === "hobbies") {
    return (
      <>
        <TitleEditor />
        <StringArrayField
          label={t("builder.hobbies") || "Sở thích"}
          items={localData}
          path={[]}
        />
      </>
    );
  }

  // Arrays (Education, Experience, Projects, Certifications, Awards, Activities, References, Languages)
  if (Array.isArray(localData)) {
    return (
      <>
        <TitleEditor />
        <div className="space-y-6">
          {localData.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-3 mb-3 border border-zinc-200 bg-white relative shadow-sm"
            >
              <button
                onClick={() => {
                  const newData = [...localData];
                  newData.splice(idx, 1);
                  onChange(newData);
                }}
                className="absolute top-2 right-2 p-1 text-zinc-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="font-bold text-[10px] tracking-widest text-zinc-400 uppercase mb-3 border-b border-zinc-100 pb-2 pr-6">
                {t("builder.item") || "Mục"} {idx + 1}
              </div>

              {activeBlock === "education" && (
                <>
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.institution") || "Trường / Cơ sở đào tạo"}
                    value={item.institution}
                    path={[idx.toString(), "institution"]}
                  />
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.degree") || "Ngành học / Bằng cấp"}
                    value={item.degree}
                    path={[idx.toString(), "degree"]}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      handleChange={handleChange}
                      label={t("builder.startDate") || "Từ năm"}
                      value={item.startDate}
                      path={[idx.toString(), "startDate"]}
                    />
                    <InputField
                      handleChange={handleChange}
                      label={t("builder.endDate") || "Đến năm"}
                      value={item.endDate}
                      path={[idx.toString(), "endDate"]}
                    />
                  </div>
                  <StringArrayField
                    label={t("builder.description") || "Mô tả / Chi tiết"}
                    items={item.description}
                    path={[idx.toString(), "description"]}
                  />
                </>
              )}

              {activeBlock === "experience" && (
                <>
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.position") || "Chức vụ"}
                    value={item.position}
                    path={[idx.toString(), "position"]}
                  />
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.company") || "Công ty"}
                    value={item.company}
                    path={[idx.toString(), "company"]}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      handleChange={handleChange}
                      label={t("builder.startDate") || "Từ tháng/năm"}
                      value={item.startDate}
                      path={[idx.toString(), "startDate"]}
                    />
                    <InputField
                      handleChange={handleChange}
                      label={t("builder.endDate") || "Đến tháng/năm"}
                      value={item.endDate}
                      path={[idx.toString(), "endDate"]}
                    />
                  </div>
                  <StringArrayField
                    label={t("builder.jobDescription") || "Mô tả công việc"}
                    items={item.description}
                    path={[idx.toString(), "description"]}
                  />
                </>
              )}

              {activeBlock === "projects" && (
                <>
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.projectName") || "Tên dự án"}
                    value={item.name}
                    path={[idx.toString(), "name"]}
                  />
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.role") || "Vai trò"}
                    value={item.role}
                    path={[idx.toString(), "role"]}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      handleChange={handleChange}
                      label={t("builder.startDate") || "Từ tháng/năm"}
                      value={item.startDate}
                      path={[idx.toString(), "startDate"]}
                    />
                    <InputField
                      handleChange={handleChange}
                      label={t("builder.endDate") || "Đến tháng/năm"}
                      value={item.endDate}
                      path={[idx.toString(), "endDate"]}
                    />
                  </div>
                  <LinkArrayField
                    label={t("builder.links") || "Liên kết dự án"}
                    items={item.links}
                    path={[idx.toString(), "links"]}
                  />
                  <StringArrayField
                    label={t("builder.projectDescription") || "Mô tả dự án"}
                    items={item.description}
                    path={[idx.toString(), "description"]}
                  />
                </>
              )}

              {activeBlock === "skills" && (
                <>
                  <InputField
                    handleChange={handleChange}
                    label={
                      t("builder.skillCategory") ||
                      "Loại kỹ năng (Vd: Frontend, Ngôn ngữ...)"
                    }
                    value={item.category}
                    path={[idx.toString(), "category"]}
                  />
                  <div className="mb-3">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                      {t("builder.skillsList") ||
                        "Các kỹ năng (cách nhau bằng dấu phẩy)"}
                    </label>
                    <AutoResizeTextarea
                      className="w-full p-2 text-xs border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors min-h-15"
                      value={item.items ? item.items.join(", ") : ""}
                      onChange={(e: any) => {
                        const arr = e.target.value
                          .split(",")
                          .map((s: string) => s.trim())
                          .filter((s: string) => s);
                        handleChange([idx.toString(), "items"], arr);
                      }}
                    />
                  </div>
                </>
              )}

              {activeBlock === "certifications" && (
                <>
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.certName") || "Tên chứng chỉ"}
                    value={item.name}
                    path={[idx.toString(), "name"]}
                  />
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.issuer") || "Tổ chức cấp"}
                    value={item.issuer}
                    path={[idx.toString(), "issuer"]}
                  />
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.date") || "Thời gian"}
                    value={item.date}
                    path={[idx.toString(), "date"]}
                  />
                </>
              )}

              {activeBlock === "awards" && (
                <>
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.awardTitle") || "Tên giải thưởng"}
                    value={item.title}
                    path={[idx.toString(), "title"]}
                  />
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.issuer") || "Tổ chức cấp"}
                    value={item.issuer}
                    path={[idx.toString(), "issuer"]}
                  />
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.date") || "Thời gian"}
                    value={item.date}
                    path={[idx.toString(), "date"]}
                  />
                </>
              )}

              {activeBlock === "activities" && (
                <>
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.organization") || "Tổ chức"}
                    value={item.organization}
                    path={[idx.toString(), "organization"]}
                  />
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.role") || "Vai trò"}
                    value={item.role}
                    path={[idx.toString(), "role"]}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      handleChange={handleChange}
                      label={t("builder.startDate") || "Từ tháng/năm"}
                      value={item.startDate}
                      path={[idx.toString(), "startDate"]}
                    />
                    <InputField
                      handleChange={handleChange}
                      label={t("builder.endDate") || "Đến tháng/năm"}
                      value={item.endDate}
                      path={[idx.toString(), "endDate"]}
                    />
                  </div>
                  <StringArrayField
                    label={
                      t("builder.activityDescription") || "Mô tả hoạt động"
                    }
                    items={item.description}
                    path={[idx.toString(), "description"]}
                  />
                </>
              )}

              {activeBlock === "references" && (
                <>
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.refName") || "Họ Tên"}
                    value={item.name}
                    path={[idx.toString(), "name"]}
                  />
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.position") || "Chức vụ"}
                    value={item.position}
                    path={[idx.toString(), "position"]}
                  />
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.company") || "Công ty"}
                    value={item.company}
                    path={[idx.toString(), "company"]}
                  />
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.contactInfo") || "Thông tin liên hệ"}
                    value={item.contactInfo}
                    path={[idx.toString(), "contactInfo"]}
                  />
                </>
              )}

              {activeBlock === "languages" && (
                <>
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.language") || "Ngôn ngữ"}
                    value={item.language}
                    path={[idx.toString(), "language"]}
                  />
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.proficiency") || "Mức độ thành thạo"}
                    value={item.proficiency}
                    path={[idx.toString(), "proficiency"]}
                  />
                </>
              )}

              {activeBlock === "customSections" && (
                <>
                  <InputField
                    handleChange={handleChange}
                    label={t("builder.sectionTitle") || "Tiêu đề mục"}
                    value={item.title}
                    path={[idx.toString(), "title"]}
                  />
                  <StringArrayField
                    label={t("builder.items") || "Nội dung (các dòng)"}
                    items={item.items}
                    path={[idx.toString(), "items"]}
                  />
                </>
              )}
            </div>
          ))}

          <button
            onClick={() => {
              const newItem =
                activeBlock === "education"
                  ? { institution: "", degree: "", startDate: "", endDate: "" }
                  : activeBlock === "experience"
                    ? {
                        company: "",
                        position: "",
                        startDate: "",
                        endDate: "",
                        description: [],
                      }
                    : activeBlock === "projects"
                      ? {
                          name: "",
                          role: "",
                          startDate: "",
                          endDate: "",
                          links: [],
                          description: [],
                        }
                      : activeBlock === "skills"
                        ? { category: "", items: [] }
                        : activeBlock === "certifications"
                          ? { name: "", issuer: "", date: "" }
                          : activeBlock === "awards"
                            ? { title: "", issuer: "", date: "" }
                            : activeBlock === "activities"
                              ? {
                                  organization: "",
                                  role: "",
                                  startDate: "",
                                  endDate: "",
                                  description: [],
                                }
                              : activeBlock === "references"
                                ? {
                                    name: "",
                                    position: "",
                                    company: "",
                                    contactInfo: "",
                                  }
                                : activeBlock === "languages"
                                  ? { language: "", proficiency: "" }
                                  : activeBlock === "customSections"
                                    ? { title: "", items: [] }
                                    : {};
              onChange([...localData, newItem]);
            }}
            className="w-full p-2.5 border border-dashed border-zinc-300 text-zinc-400 font-bold text-[10px] tracking-widest uppercase hover:bg-black hover:border-black hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-3 h-3" /> {t("builder.add") || "Thêm"}{" "}
            {activeBlock} {t("builder.new") || "mới"}
          </button>
        </div>
      </>
    );
  }

  // Fallback for unhandled blocks
  return (
    <div className="text-sm text-zinc-500">
      {t("builder.jsonViewWarning") ||
        "Đang hiển thị dữ liệu JSON (Chưa hỗ trợ Form UI riêng cho khối này):"}
      <AutoResizeTextarea
        className="w-full p-2 font-mono text-xs border border-zinc-300 mt-2 min-h-37.5"
        value={
          typeof localData === "string"
            ? localData
            : JSON.stringify(localData, null, 2)
        }
        onChange={(e: any) => {
          try {
            const val = JSON.parse(e.target.value);
            setLocalData(val);
            onChange(val);
          } catch (err) {
            setLocalData(e.target.value);
          }
        }}
      />
    </div>
  );
}
