import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface BlockEditorFormProps {
  activeBlock: string;
  data: any;
  onChange: (newData: any) => void;
  sectionTitle?: string;
  onTitleChange?: (newTitle: string) => void;
}

export function BlockEditorForm({ activeBlock, data, onChange, sectionTitle, onTitleChange }: BlockEditorFormProps) {
  const { t } = useTranslation();
  // Use local state to handle fast typing, then debounce or flush to parent on blur/save
  const [localData, setLocalData] = useState<any>(data);

  useEffect(() => {
    setLocalData(data);
  }, [activeBlock, data]);

  const handleChange = (path: string[], value: any) => {
    let newData = Array.isArray(localData) ? [...localData] : (typeof localData === 'object' && localData !== null ? { ...localData } : localData);

    if (path.length === 0) {
      newData = value;
    } else if (path.length === 1) {
      newData[path[0]] = value;
    } else if (path.length === 2) {
      newData[path[0]] = Array.isArray(newData[path[0]]) ? [...newData[path[0]]] : { ...newData[path[0]] };
      newData[path[0]][path[1]] = value;
    } else if (path.length === 3) {
      newData[path[0]] = Array.isArray(newData[path[0]]) ? [...newData[path[0]]] : { ...newData[path[0]] };
      newData[path[0]][path[1]] = Array.isArray(newData[path[0]][path[1]]) ? [...newData[path[0]][path[1]]] : { ...newData[path[0]][path[1]] };
      newData[path[0]][path[1]][path[2]] = value;
    }

    setLocalData(newData);
    onChange(newData);
  };

  const InputField = ({ label, value, path, type = "text" }: any) => (
    <div className="mb-3">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{label}</label>
      {type === "textarea" ? (
        <textarea
          className="w-full p-2 text-xs border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors min-h-20"
          value={value || ''}
          onChange={(e) => handleChange(path, e.target.value)}
        />
      ) : (
        <input
          type="text"
          className="w-full p-2 text-xs border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors"
          value={value || ''}
          onChange={(e) => handleChange(path, e.target.value)}
        />
      )}
    </div>
  );

  const StringArrayField = ({ label, items, path }: any) => (
    <div className="mb-3">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{label}</label>
      {(items || []).map((item: string, idx: number) => (
        <div key={idx} className="flex gap-1 mb-1.5">
          <textarea
            className="flex-1 p-2 text-xs border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors min-h-10"
            value={item || ''}
            onChange={(e) => handleChange([...path, idx.toString()], e.target.value)}
          />
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
          const newItems = [...(items || []), ''];
          handleChange(path, newItems);
        }}
        className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border border-zinc-200 px-3 py-1.5 hover:bg-black hover:text-white hover:border-black transition-colors flex items-center gap-1 mt-1"
      >
        <Plus className="w-3 h-3" /> {t('builder.addRow') || 'Thêm dòng'}
      </button>
    </div>
  );

  const LinkArrayField = ({ label, items, path }: any) => (
    <div className="mb-3">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{label}</label>
      {(items || []).map((item: any, idx: number) => (
        <div key={idx} className="flex gap-1 mb-1.5 items-start">
          <div className="flex-1 space-y-1">
            <input
              type="text"
              placeholder={t('builder.linkName') || "Tên (VD: GitHub)"}
              className="w-full p-2 text-xs border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors"
              value={item.name || ''}
              onChange={(e) => handleChange([...path, idx.toString(), 'name'], e.target.value)}
            />
            <input
              type="text"
              placeholder={t('builder.linkUrl') || "URL (VD: https://github.com/...)"}
              className="w-full p-2 text-xs border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors"
              value={item.url || ''}
              onChange={(e) => handleChange([...path, idx.toString(), 'url'], e.target.value)}
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
          const newItems = [...(items || []), { name: '', url: '' }];
          handleChange(path, newItems);
        }}
        className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border border-zinc-200 px-3 py-1.5 hover:bg-black hover:text-white hover:border-black transition-colors flex items-center gap-1 mt-1"
      >
        <Plus className="w-3 h-3" /> {t('builder.addLink') || 'Thêm liên kết'}
      </button>
    </div>
  );

  const TitleEditor = () => {
    if (onTitleChange === undefined || activeBlock === 'personal' || activeBlock === 'recipient') return null;
    return (
      <div className="mb-6 pb-4 border-b border-zinc-200">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-800 mb-1">{t('builder.sectionTitleLabel') || 'Tiêu đề khối hiển thị trên CV'}</label>
        <input
          type="text"
          className="w-full p-2 text-xs border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors font-bold"
          value={sectionTitle || ''}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t('builder.sectionTitlePlaceholder') || "VD: Kinh nghiệm làm việc"}
        />
      </div>
    );
  };

  // -- SPECIFIC RENDERERS --

  if (activeBlock === 'personal') {
    return (
      <div className="space-y-1">
        <InputField label={t('builder.avatar') || "Ảnh đại diện (URL)"} value={localData?.avatar} path={['avatar']} />
        <InputField label={t('builder.fullName') || "Họ và Tên"} value={localData?.fullName} path={['fullName']} />
        <InputField label={t('builder.jobTitle') || "Vị trí / Chức danh"} value={localData?.jobTitle} path={['jobTitle']} />
        <div className="grid grid-cols-2 gap-2">
           <InputField label={t('builder.dob') || "Ngày sinh"} value={localData?.dob} path={['dob']} />
           <InputField label={t('builder.gender') || "Giới tính"} value={localData?.gender} path={['gender']} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField label={t('builder.email') || "Email"} value={localData?.email} path={['email']} />
          <InputField label={t('builder.phone') || "Số điện thoại"} value={localData?.phone} path={['phone']} />
        </div>
        <InputField label={t('builder.address') || "Địa chỉ"} value={localData?.location} path={['location']} />
        <InputField label={t('builder.portfolio') || "Portfolio"} value={localData?.portfolio} path={['portfolio']} />
        <LinkArrayField label={t('builder.links') || "Các liên kết khác"} items={localData?.links} path={['links']} />
      </div>
    );
  }

  if (activeBlock === 'summary') {
    return (
      <>
        <TitleEditor />
        <InputField label={t('builder.summary') || "Tóm tắt mục tiêu (Summary)"} value={localData} path={[]} type="textarea" />
      </>
    );
  }

  // Cover letter specific
  if (activeBlock === 'recipient') {
    return (
      <div className="space-y-1">
        <InputField label={t('builder.recipientName') || "Tên người nhận"} value={localData?.name} path={['name']} />
        <InputField label={t('builder.position') || "Chức vụ"} value={localData?.title} path={['title']} />
        <InputField label={t('builder.company') || "Công ty"} value={localData?.company} path={['company']} />
        <InputField label={t('builder.address') || "Địa chỉ"} value={localData?.address} path={['address']} />
      </div>
    );
  }

  if (activeBlock === 'salutation') return <InputField label={t('builder.salutation') || "Lời chào"} value={localData} path={[]} />;
  if (activeBlock === 'date') return <InputField label={t('builder.date') || "Ngày tháng"} value={localData} path={[]} />;
  if (activeBlock === 'signOff') return <InputField label={t('builder.signOff') || "Chữ ký / Lời kết"} value={localData} path={[]} type="textarea" />;

  if (activeBlock === 'body') {
    return (
      <div className="space-y-2">
        <InputField label={t('builder.opening') || "Mở đầu (Opening)"} value={localData?.opening} path={['opening']} type="textarea" />
        <StringArrayField label={t('builder.bodyParagraphs') || "Các đoạn nội dung chính"} items={localData?.bodyParagraphs} path={['bodyParagraphs']} />
        <InputField label={t('builder.closing') || "Kết luận (Closing)"} value={localData?.closing} path={['closing']} type="textarea" />
      </div>
    );
  }

  // Hobbies is an array of strings, handle explicitly
  if (activeBlock === 'hobbies') {
    return (
      <>
        <TitleEditor />
        <StringArrayField label={t('builder.hobbies') || "Sở thích"} items={localData} path={[]} />
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
            <div key={idx} className="p-3 mb-3 border border-zinc-200 bg-white relative shadow-sm">
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
              <div className="font-bold text-[10px] tracking-widest text-zinc-400 uppercase mb-3 border-b border-zinc-100 pb-2 pr-6">{t('builder.item') || 'Mục'} {idx + 1}</div>

              {activeBlock === 'education' && (
                <>
                  <InputField label={t('builder.institution') || "Trường / Cơ sở đào tạo"} value={item.institution} path={[idx.toString(), 'institution']} />
                  <InputField label={t('builder.degree') || "Ngành học / Bằng cấp"} value={item.degree} path={[idx.toString(), 'degree']} />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label={t('builder.startDate') || "Từ năm"} value={item.startDate} path={[idx.toString(), 'startDate']} />
                    <InputField label={t('builder.endDate') || "Đến năm"} value={item.endDate} path={[idx.toString(), 'endDate']} />
                  </div>
                  <StringArrayField label={t('builder.description') || "Mô tả / Chi tiết"} items={item.description} path={[idx.toString(), 'description']} />
                </>
              )}

              {activeBlock === 'experience' && (
                <>
                  <InputField label={t('builder.position') || "Chức vụ"} value={item.position} path={[idx.toString(), 'position']} />
                  <InputField label={t('builder.company') || "Công ty"} value={item.company} path={[idx.toString(), 'company']} />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label={t('builder.startDate') || "Từ tháng/năm"} value={item.startDate} path={[idx.toString(), 'startDate']} />
                    <InputField label={t('builder.endDate') || "Đến tháng/năm"} value={item.endDate} path={[idx.toString(), 'endDate']} />
                  </div>
                  <StringArrayField label={t('builder.jobDescription') || "Mô tả công việc"} items={item.description} path={[idx.toString(), 'description']} />
                </>
              )}

              {activeBlock === 'projects' && (
                <>
                  <InputField label={t('builder.projectName') || "Tên dự án"} value={item.name} path={[idx.toString(), 'name']} />
                  <InputField label={t('builder.role') || "Vai trò"} value={item.role} path={[idx.toString(), 'role']} />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label={t('builder.startDate') || "Từ tháng/năm"} value={item.startDate} path={[idx.toString(), 'startDate']} />
                    <InputField label={t('builder.endDate') || "Đến tháng/năm"} value={item.endDate} path={[idx.toString(), 'endDate']} />
                  </div>
                  <LinkArrayField label={t('builder.links') || "Liên kết dự án"} items={item.links} path={[idx.toString(), 'links']} />
                  <StringArrayField label={t('builder.projectDescription') || "Mô tả dự án"} items={item.description} path={[idx.toString(), 'description']} />
                </>
              )}

              {activeBlock === 'skills' && (
                <>
                  <InputField label={t('builder.skillCategory') || "Loại kỹ năng (Vd: Frontend, Ngôn ngữ...)"} value={item.category} path={[idx.toString(), 'category']} />
                  <div className="mb-3">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{t('builder.skillsList') || 'Các kỹ năng (cách nhau bằng dấu phẩy)'}</label>
                    <textarea
                      className="w-full p-2 text-xs border border-zinc-200 focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors min-h-15"
                      value={item.items ? item.items.join(', ') : ''}
                      onChange={(e) => {
                         const arr = e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s);
                         handleChange([idx.toString(), 'items'], arr);
                      }}
                    />
                  </div>
                </>
              )}

              {activeBlock === 'certifications' && (
                <>
                  <InputField label={t('builder.certName') || "Tên chứng chỉ"} value={item.name} path={[idx.toString(), 'name']} />
                  <InputField label={t('builder.issuer') || "Tổ chức cấp"} value={item.issuer} path={[idx.toString(), 'issuer']} />
                  <InputField label={t('builder.date') || "Thời gian"} value={item.date} path={[idx.toString(), 'date']} />
                </>
              )}

              {activeBlock === 'awards' && (
                <>
                  <InputField label={t('builder.awardTitle') || "Tên giải thưởng"} value={item.title} path={[idx.toString(), 'title']} />
                  <InputField label={t('builder.issuer') || "Tổ chức cấp"} value={item.issuer} path={[idx.toString(), 'issuer']} />
                  <InputField label={t('builder.date') || "Thời gian"} value={item.date} path={[idx.toString(), 'date']} />
                </>
              )}

              {activeBlock === 'activities' && (
                <>
                  <InputField label={t('builder.organization') || "Tổ chức"} value={item.organization} path={[idx.toString(), 'organization']} />
                  <InputField label={t('builder.role') || "Vai trò"} value={item.role} path={[idx.toString(), 'role']} />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label={t('builder.startDate') || "Từ tháng/năm"} value={item.startDate} path={[idx.toString(), 'startDate']} />
                    <InputField label={t('builder.endDate') || "Đến tháng/năm"} value={item.endDate} path={[idx.toString(), 'endDate']} />
                  </div>
                  <StringArrayField label={t('builder.activityDescription') || "Mô tả hoạt động"} items={item.description} path={[idx.toString(), 'description']} />
                </>
              )}

              {activeBlock === 'references' && (
                <>
                  <InputField label={t('builder.refName') || "Họ Tên"} value={item.name} path={[idx.toString(), 'name']} />
                  <InputField label={t('builder.position') || "Chức vụ"} value={item.position} path={[idx.toString(), 'position']} />
                  <InputField label={t('builder.company') || "Công ty"} value={item.company} path={[idx.toString(), 'company']} />
                  <InputField label={t('builder.contactInfo') || "Thông tin liên hệ"} value={item.contactInfo} path={[idx.toString(), 'contactInfo']} />
                </>
              )}

              {activeBlock === 'languages' && (
                <>
                  <InputField label={t('builder.language') || "Ngôn ngữ"} value={item.language} path={[idx.toString(), 'language']} />
                  <InputField label={t('builder.proficiency') || "Mức độ thành thạo"} value={item.proficiency} path={[idx.toString(), 'proficiency']} />
                </>
              )}
            </div>
          ))}

          <button
            onClick={() => {
              const newItem = activeBlock === 'education' ? { institution: '', degree: '', startDate: '', endDate: '' } :
                activeBlock === 'experience' ? { company: '', position: '', startDate: '', endDate: '', description: [] } :
                  activeBlock === 'projects' ? { name: '', role: '', startDate: '', endDate: '', links: [], description: [] } :
                    activeBlock === 'skills' ? { category: '', items: [] } :
                      activeBlock === 'certifications' ? { name: '', issuer: '', date: '' } :
                        activeBlock === 'awards' ? { title: '', issuer: '', date: '' } :
                          activeBlock === 'activities' ? { organization: '', role: '', startDate: '', endDate: '', description: [] } :
                            activeBlock === 'references' ? { name: '', position: '', company: '', contactInfo: '' } :
                              activeBlock === 'languages' ? { language: '', proficiency: '' } : {};
              onChange([...localData, newItem]);
            }}
            className="w-full p-2.5 border border-dashed border-zinc-300 text-zinc-400 font-bold text-[10px] tracking-widest uppercase hover:bg-black hover:border-black hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-3 h-3" /> {t('builder.add') || 'Thêm'} {activeBlock} {t('builder.new') || 'mới'}
          </button>
        </div>
      </>
    );
  }

  // Fallback for unhandled blocks
  return (
    <div className="text-sm text-zinc-500">
      {t('builder.jsonViewWarning') || 'Đang hiển thị dữ liệu JSON (Chưa hỗ trợ Form UI riêng cho khối này):'}
      <textarea
        className="w-full p-2 font-mono text-xs border border-zinc-300 mt-2 min-h-37.5"
        value={typeof localData === 'string' ? localData : JSON.stringify(localData, null, 2)}
        onChange={(e) => {
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
