import { $api } from "../Headers"

class Question {
    // Get
    static GetQuestion = async () => {
        const response = await $api.get(`/questions`);
        return response;
    }
    // Get
    static GetFirsQuestion = async () => {
        const response = await $api.get(`/questions/one`);
        return response;
    }
    static GetQuestionByid = async (id) => {
        const response = await $api.get(`/questions/${id}`);
        return response;
    }
    // Create 
    static CreatePost = async (Data) => {
        const response = await $api.post(`/questions`, Data)
        return response;
    }
    // Edit
    static EditCategory = async (Data) => {
        const response = await $api.put(`/category/update/${Data?.id}`, Data)
        return response
    }
    // Delete 
    static DeleteCategory = async (id) => {
        const response = await $api.delete(`/category/delete/${id}`)
        return response;
    }

}

export { Question }