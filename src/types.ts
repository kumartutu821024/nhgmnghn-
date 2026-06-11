export interface Course {
  courseId: number;
  courseTypeId: number;
  title: string;
  thumbnailUrl: string;
  slug: string;
  tags?: string[] | null;
  basePrice: number;
  discountPrice: number;
  bestSelling?: boolean | null;
  info: string;
  freeCourse: boolean;
  offlineCourse: boolean;
  onlineCourse: boolean;
  offlineDetails?: any;
}

export interface ContentItem {
  parentId: number;
  parentTitle: string;
  elementContentType: number; // 3 = Video, 1 = Note/Crux PDF, 9 = Prelims Test
  id: string;
  contentId: number;
  name: string;
  slug?: string;
  videoTypeId?: number;
  isDrmEnabled?: number;
  date: string;
  isNewlyAdded?: number;
  resultAvailable?: boolean;
  orderNo?: number;
  referenceId?: string;
  videoUrl?: string; // M3U8 source for elementContentType === 3
  textUploadUrl?: string; // PDF link for elementContentType === 1
  updatedAt?: string;
  languageId?: number;
  facultyName?: string;
  testId?: number; // elementContentType === 9
  numberOfQuestions?: number;
  duration?: number;
  testStatus?: string;
  published?: boolean;
  sfJson?: string;
  v2Json?: string;
  zipUpdatedAt?: string;
  endDate?: string;
  endTime?: string;
  fixedMock?: boolean;
}

export interface CourseContentResponse {
  success: boolean;
  data: {
    success: number;
    courseId: number;
    courseTitle: string | null;
    courseSlug: string | null;
    parentId: string;
    parentTitle: string;
    isCoursePurchased: number;
    courseTemplateTypeId: number;
    courseTypeName: string | null;
    parents: any;
    data: ContentItem[];
    message: string;
  };
}
