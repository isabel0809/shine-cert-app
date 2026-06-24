export type Project = 
  | '竹山專案' 
  | '太陽能專案' 
  | '深水池專案'
  | '南港專案'
  | '內湖商辦工程'
  | '中壢擴建案'
  | '高雄駁二維護'
  | '新板特區開發'
  | '閒置人員';

export type LicenseCategory = 
  | '工安職安衛' 
  | '作業主管' 
  | '機具操作' 
  | '工程品管' 
  | '機電環保' 
  | '特殊作業';

export interface LicenseEvent {
  id: string;
  name: string; // Worker name
  licenseName: string; // Full license name
  expiryDate: Date;
  issueDate?: Date; // Award/Issue date
  project: Project;
  category: LicenseCategory;
  previousRecertification?: string; // Record info
  notes?: string;
  attachmentName?: string;
}

export interface FilterState {
  project: Project | '全部';
  category: LicenseCategory | '全部';
}
