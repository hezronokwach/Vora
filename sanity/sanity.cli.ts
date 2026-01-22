import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: 'your_project_id',
    dataset: 'production',
  },
});
