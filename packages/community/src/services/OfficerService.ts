import { API } from '~/services';
import type { OfficerGeneration, OfficerRole } from '~/services/types';

const OfficerService = {
  /** Every 기수, newest first. 해왕성(8) and above. */
  retrieveOfficers: function () {
    return API.get<{ success: boolean; generations: OfficerGeneration[] }>(
      'officers',
    );
  },

  /** Creates the 기수 or replaces its roles. 토성(6) and above. */
  saveOfficers: function (generation: number, roles: OfficerRole[]) {
    return API.put<{ success: boolean; generation: OfficerGeneration }>(
      `officers/${generation}`,
      { roles },
    );
  },

  /** 토성(6) and above. */
  deleteOfficers: function (generation: number) {
    return API.delete(`officers/${generation}`);
  },
};

export default OfficerService;
