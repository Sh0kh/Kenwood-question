import axios from "axios"

class Customer {
    static CreateCustomer = async (data) => {
        const response = await axios.post(`/customers`, data)
        return response;
    }
    static GetCustomer = async () => {
        const response = await axios.get(`/customers`)
        return response;
    }
    static GetCustomerDetail = async (id) => {
        const response = await axios.get(`/customers/${id}`)
        return response;
    }
    static DeleteCustomer = async (id) => {
        const response = await axios.delete(`/customers/${id}`)
        return response;
    }
    static EditCustomer = async (data, id) => {
        const response = await axios.put(`/customers/${id}`, data)
        return response;
    }
} export { Customer }