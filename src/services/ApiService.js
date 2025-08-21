class ApiService {
    constructor(setUser, getUserToken) {
        this.setUser = setUser;
        this.getUserToken = getUserToken;
        this.baseURL = import.meta.env.VITE_BASE_API_URL; 
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            credentials: 'include',
            headers: {
                'x-token': this.getUserToken() ?? '',
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            // Si la respuesta es 401 (no autorizado), la sesión expiró
            if (response.status === 401) {
                this.setUser(null);
                window.location.href = '/login';
                return null;
            }

            // Si la respuesta es 403 (forbidden), sin permisos
            if (response.status === 403) {
                throw new Error('No tienes permisos para realizar esta acción');
            }

            return response;
        } catch (error) {
            // Si es un error de red y no hemos manejado el 401
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Error de conexión. Verifica tu internet.');
            }

            throw error;
        }
    }

    // Métodos de conveniencia
    async get(endpoint) {
        const response = await this.request(endpoint);
        return response;
    }

    async post(endpoint, data) {
        const response = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }

    async put(endpoint, data) {
        const response = await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response;
    }

    async patch(endpoint, data) {
        const response = await this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return response;
    }

    async delete(endpoint) {
        const response = await this.request(endpoint, {
            method: 'DELETE',
        });
        return response;
    }

    // Método para subir archivos
    async upload(endpoint, formData) {
        const response = await this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                'x-token': this.getUserToken() ?? ''
            },
        });
        return response;
    }
}

export default ApiService;