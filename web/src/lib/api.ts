const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{
      token: string;
      refreshToken: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async me() {
    return this.request<any>('/auth/me');
  }

  // Projects
  async getProjects() {
    return this.request<any[]>('/proyectos');
  }

  async getProject(id: string) {
    return this.request<any>(`/proyectos/${id}`);
  }

  async createProject(data: any) {
    return this.request<any>('/proyectos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: any) {
    return this.request<any>(`/proyectos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request<any>(`/proyectos/${id}`, {
      method: 'DELETE',
    });
  }

  // Stations
  async getStations(projectId: string) {
    return this.request<any[]>(`/estaciones?project_id=${projectId}`);
  }

  async getStation(id: string) {
    return this.request<any>(`/estaciones/${id}`);
  }

  async createStation(data: any) {
    return this.request<any>('/estaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStation(id: string, data: any) {
    return this.request<any>(`/estaciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStation(id: string) {
    return this.request<any>(`/estaciones/${id}`, {
      method: 'DELETE',
    });
  }

  async updateHotspotMap(id: string, hotspot_map: any[]) {
    return this.request<any>(`/estaciones/${id}/hotspot-map`, {
      method: 'PUT',
      body: JSON.stringify({ hotspot_map }),
    });
  }

  async addStationSelection(stationId: string, data: any) {
    return this.request<any>(`/estaciones/${stationId}/selecciones`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteStationSelection(stationId: string, selectionId: string) {
    return this.request<any>(`/estaciones/${stationId}/selecciones/${selectionId}`, {
      method: 'DELETE',
    });
  }

  async addStationPanelOption(stationId: string, data: any) {
    return this.request<any>(`/estaciones/${stationId}/panel-options`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteStationPanelOption(stationId: string, panelOptionId: string) {
    return this.request<any>(`/estaciones/${stationId}/panel-options/${panelOptionId}`, {
      method: 'DELETE',
    });
  }

  // POAs
  async getPOAs(stationId: string) {
    return this.request<any[]>(`/poas?station_id=${stationId}`);
  }

  async getPOA(id: string) {
    return this.request<any>(`/poas/${id}`);
  }

  async createPOA(data: any) {
    return this.request<any>('/poas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePOA(id: string, data: any) {
    return this.request<any>(`/poas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePOA(id: string) {
    return this.request<any>(`/poas/${id}`, {
      method: 'DELETE',
    });
  }

  async addPOASensor(poaId: string, data: any) {
    return this.request<any>(`/poas/${poaId}/sensores`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deletePOASensor(poaId: string, sensorId: string) {
    return this.request<any>(`/poas/${poaId}/sensores/${sensorId}`, {
      method: 'DELETE',
    });
  }

  // Sensors
  async getSensors(params?: { type?: string; montaje_permitido?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/sensores${query ? `?${query}` : ''}`);
  }

  async getSensor(id: string) {
    return this.request<any>(`/sensores/${id}`);
  }

  // Hotspots
  async getHotspots() {
    return this.request<any[]>('/hotspots');
  }

  // Panel Options
  async getPanelOptions(tipo?: string) {
    return this.request<any[]>(`/opciones-cuadro${tipo ? `?tipo=${tipo}` : ''}`);
  }

  // Helpers
  async calculateCablePrice(sensorId: string, metros: number) {
    return this.request<any>(`/precios/cable?sensor_id=${sensorId}&metros=${metros}`);
  }

  async estimateInstallation(provincia: string, numEstaciones: number) {
    return this.request<any>(
      `/instalacion/estimacion?provincia=${provincia}&num_estaciones=${numEstaciones}`
    );
  }

  // Admin - Sensors
  async createSensor(data: any) {
    return this.request<any>('/sensores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSensor(id: string, data: any) {
    return this.request<any>(`/sensores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSensor(id: string) {
    return this.request<any>(`/sensores/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin - Hotspots
  async createHotspot(data: any) {
    return this.request<any>('/hotspots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHotspot(key: string, data: any) {
    return this.request<any>(`/hotspots/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHotspot(key: string) {
    return this.request<any>(`/hotspots/${key}`, {
      method: 'DELETE',
    });
  }

  // Admin - Panel Options
  async getPanelOption(id: string) {
    return this.request<any>(`/opciones-cuadro/${id}`);
  }

  async createPanelOption(data: any) {
    return this.request<any>('/opciones-cuadro', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePanelOption(id: string, data: any) {
    return this.request<any>(`/opciones-cuadro/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePanelOption(id: string) {
    return this.request<any>(`/opciones-cuadro/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin - Users
  async getUsers() {
    return this.request<any[]>('/admin/usuarios');
  }

  async updateUserRole(id: string, role: string) {
    return this.request<any>(`/admin/usuarios/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  // Admin - Import/Export
  async exportData() {
    return this.request<any>('/admin/export');
  }

  async importData(data: any) {
    return this.request<any>('/admin/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin - Installation Config
  async getInstallationConfig() {
    return this.request<any>('/admin/config/instalacion');
  }

  async updateInstallationConfig(data: any) {
    return this.request<any>('/admin/config/instalacion', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Admin - Overview
  async getOverview() {
    return this.request<any>('/admin/overview');
  }
}

export const api = new ApiClient();

