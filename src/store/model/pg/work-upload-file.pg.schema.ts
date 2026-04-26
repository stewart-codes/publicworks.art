// src/model/pg/work-upload-file.pg.schema.ts
import { EntitySchema } from 'typeorm';

export interface WorkUploadFilePg {
  id: string;
  workId: number;
  filename: string;
  createdAt: Date;
  updatedAt: Date;
}

export const WorkUploadFilePgSchema = new EntitySchema<WorkUploadFilePg>({
  name: 'WorkUploadFilePg',
  tableName: 'work_upload_files',
  columns: {
    id: { type: 'uuid', primary: true, name: 'id' },
    workId: { type: 'int', name: 'work_id', nullable: false },
    filename: { type: 'varchar', name: 'filename', nullable: false },
    createdAt: { type: 'timestamptz', name: 'created_at', createDate: true },
    updatedAt: { type: 'timestamptz', name: 'updated_at', updateDate: true },
  },
  indices: [{ columns: ['workId'], name: 'idx_work_upload_files_work_id' }],
});
