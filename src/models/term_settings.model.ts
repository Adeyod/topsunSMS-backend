import mongoose, { Schema } from 'mongoose';
import { termEnum } from '../constants/enum';
import { TermSettingsDocument } from '../constants/types';

const termSettingsSchema = new Schema<TermSettingsDocument>(
  {
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    term: { type: String, required: true, enum: termEnum },
    date_of_resumption: { type: Date },
    date_of_vacation: { type: Date },
  },
  { timestamps: true }
);

const TermSettings = mongoose.model<TermSettingsDocument>(
  'TermSetting',
  termSettingsSchema
);
export default TermSettings;

/**
 * date_of_resumption: 2026-01-05T00:00:00.000+00:00
 * date_of_vacation: 2025-12-10T00:00:00.000+00:00
 */
