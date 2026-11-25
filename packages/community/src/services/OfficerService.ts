import { API } from '~/services';
import type { OfficerGeneration, OfficerInput } from '~/services/types';

const OfficerService = {
  /** Every 기수, newest first. Any signed-in user. */
  retrieveOfficers: function () {
    return API.get<{ success: boolean; generations: OfficerGeneration[] }>(
      'officers',
    );
  },

  /**
   * Creates the 기수 or replaces its 회장 and roles. 운영진 any 기수, 현 회장
   * only the current or next one (`canSaveOfficers`).
   */
  saveOfficers: function (generation: number, input: OfficerInput) {
    return API.put<{ success: boolean; generation: OfficerGeneration }>(
      `officers/${generation}`,
      input,
    );
  },

  /** 운영진 and above. */
  deleteOfficers: function (generation: number) {
    return API.delete(`officers/${generation}`);
  },
};

export default OfficerService;
