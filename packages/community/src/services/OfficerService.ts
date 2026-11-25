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
   * only their own, the newest (`canSaveOfficers`).
   */
  saveOfficers: function (generation: number, input: OfficerInput) {
    return API.put<{ success: boolean; generation: OfficerGeneration }>(
      `officers/${generation}`,
      input,
    );
  },

  /**
   * 회기 넘기기: 현 회장 becomes 화성 (4), the member becomes 목성 (5), and
   * the next 기수 starts with them as 회장. 운영진 or 현 회장.
   */
  handOver: function (presidentUuid: string) {
    return API.post<{ success: boolean; generation: OfficerGeneration }>(
      'officers/handover',
      { president_uuid: presidentUuid },
    );
  },

  /** 운영진 and above. */
  deleteOfficers: function (generation: number) {
    return API.delete(`officers/${generation}`);
  },
};

export default OfficerService;
