// Inngest client + scheduled functions
import { Inngest, EventSchemas } from "inngest";

type Events = {
  "content/submitted": {
    data: {
      contentId: string;
      type: string;
      title: string;
      authorName: string;
    };
  };
  "content/approved": {
    data: {
      contentId: string;
      editorEmail: string;
      title: string;
    };
  };
  "content/rejected": {
    data: {
      contentId: string;
      editorEmail: string;
      title: string;
      reason: string;
    };
  };
  "inquiry/created": {
    data: {
      inquiryId: string;
      division: string;
    };
  };
  "user/registered": {
    data: {
      userId: string;
      email: string;
      name: string;
    };
  };
};

export const inngest = new Inngest({
  id: "groovethiopia-backend",
  schemas: new EventSchemas().fromRecord<Events>(),
});