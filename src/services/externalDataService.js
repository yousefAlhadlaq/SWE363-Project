import api from '../utils/api';

const externalDataService = {
  async getCentralBankAccounts() {
    return api.get('/external/bank/accounts');
  },
  async getCentralBankSummary() {
    return api.get('/external/all');
  },
  async performCentralBankOperation(payload) {
    return api.post('/external/operation', payload);
  }
};

export default externalDataService;
