export interface IBasicType {
  title: string;     // 页面标题
  url: string;       // 页面URL
  timestamp: string; // 访问时间戳
  userAgent: string; // 用户浏览器类型
  kind: string;      // 大类
  type: string;      // 小类
  errorType: string; // 错误类型
  message: string;   // 错误信息
  filename: string;  // 访问的文件名
  position: string;  // 行列信息
  stack: string[];     // 堆栈信息
  selector: string;  // 选择器
}

export type BasicType = Partial<IBasicType>;
