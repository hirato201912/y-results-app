export type Topic = {
    id: string;
    name: string;
    content: string;
    date: string;
    teacher: string;
    status: "完了" | "進行中" | "未開始";
    ctStatus: "未実施" | "合格" | "不合格" | "";
    homeworkStatus: "未チェック" | "やってきている" | "やってきていない" | "";
    homeworkAssigned: boolean;
    isTestRange: boolean;
    isSchoolCompleted: boolean;
    isHidden: boolean;
  };
  
  // 英語のダミーデータ
  export const initialEnglishTopics: Topic[] = [
    { 
      id: "1-1", 
      name: "基礎文法", 
      content: "文法の基本", 
      date: "2024-05-01", 
      teacher: "田中 太郎", 
      status: "完了", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: true, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
    { 
      id: "1-2", 
      name: "語彙増強", 
      content: "語彙力向上", 
      date: "", 
      teacher: "", 
      status: "進行中", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: false, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
  ];
  
  // 数学のダミーデータ
  export const initialMathTopics: Topic[] = [
    { 
      id: "1-1", 
      name: "ノートの使い方", 
      content: "ノートの使い方", 
      date: "", 
      teacher: "", 
      status: "進行中", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: false, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
    { 
      id: "1-3", 
      name: "正負の数", 
      content: "正負の数", 
      date: "", 
      teacher: "", 
      status: "進行中", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: false, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
    { 
      id: "1-4", 
      name: "反対の性質をもつ量", 
      content: "反対の性質をもつ量", 
      date: "", 
      teacher: "", 
      status: "進行中", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: false, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
    { 
      id: "1-5", 
      name: "数直線", 
      content: "数直線", 
      date: "", 
      teacher: "", 
      status: "進行中", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: false, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
    { 
      id: "1-6", 
      name: "絶対値", 
      content: "絶対値", 
      date: "", 
      teacher: "", 
      status: "進行中", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: false, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
    { 
      id: "1-7", 
      name: "数の大小", 
      content: "数の大小", 
      date: "", 
      teacher: "", 
      status: "進行中", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: false, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
    { 
      id: "1-8", 
      name: "正負の数の計算", 
      content: "正負の数の計算", 
      date: "", 
      teacher: "", 
      status: "進行中", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: true, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
    { 
      id: "1-9", 
      name: "かっこのついた数の加法", 
      content: "かっこのついた数の加法", 
      date: "", 
      teacher: "", 
      status: "進行中", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: true, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
    { 
      id: "1-10", 
      name: "かっこのついた数の減法", 
      content: "かっこのついた数の減法", 
      date: "", 
      teacher: "", 
      status: "進行中", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: true, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
    { 
      id: "1-11", 
      name: "小数と分数の加減", 
      content: "小数と分数の加減", 
      date: "", 
      teacher: "", 
      status: "進行中", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: false, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
  ];
  
  // 理科のダミーデータ
  export const initialScienceTopics: Topic[] = [
    { 
      id: "3-1", 
      name: "物理", 
      content: "運動の法則", 
      date: "2024-07-01", 
      teacher: "山田 一郎", 
      status: "完了", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: true, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
    { 
      id: "3-2", 
      name: "化学", 
      content: "元素記号", 
      date: "", 
      teacher: "", 
      status: "進行中", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: false, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
  ];
  
  // 社会のダミーデータ
  export const initialSocialStudiesTopics: Topic[] = [
    { 
      id: "4-1", 
      name: "歴史", 
      content: "鎌倉時代", 
      date: "2024-08-01", 
      teacher: "森田 太郎", 
      status: "完了", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: true, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
    { 
      id: "4-2", 
      name: "地理", 
      content: "日本の地形", 
      date: "", 
      teacher: "", 
      status: "進行中", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: false, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
  ];
  
  // 国語のダミーデータ
  export const initialJapaneseTopics: Topic[] = [
    { 
      id: "5-1", 
      name: "古文", 
      content: "源氏物語", 
      date: "2024-09-01", 
      teacher: "大木 花子", 
      status: "完了", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: true, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
    { 
      id: "5-2", 
      name: "漢字", 
      content: "漢字の成り立ち", 
      date: "", 
      teacher: "", 
      status: "進行中", 
      ctStatus: "未実施", 
      homeworkStatus: "未チェック", 
      homeworkAssigned: false, 
      isTestRange: false, 
      isSchoolCompleted: false, 
      isHidden: false 
    },
  ];
  