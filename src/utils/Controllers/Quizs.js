import { $api } from "../Headers"

class Quizs {
    // Get
    static StartQuiz = async (data) => {
        const response = await $api.post(`/quizzes`, data);
        return response;
    }
    static EndQuiz = async (data) => {
        const response = await $api.post(`/results`, data);
        return response;
    }
    static GetResult = async (id) => {
        const response = await $api.get(`/results/${id}`);
        return response;
    }

}

export { Quizs }