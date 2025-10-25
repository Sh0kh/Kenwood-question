import Client from "../Components/Client/Client";
import ClientDetail from "../Components/ClientDetail/ClientDetail";
import Dashboard from "../Components/Dashboard/Dashboard";
import Quiz from "../Components/Quiz/Quiz";
import QuizDetail from "../Components/QuizDetail/QuizDetail";

export const Rout = [
    {
        name: 'Home',
        path: '/',
        component: <Dashboard />
    },
    {
        name: 'Client',
        path: '/client',
        component: <Client />
    },
    {
        name: 'Client detail',
        path: '/client/:id',
        component: <ClientDetail />
    },
    {
        name: 'Quiz',
        path: '/quiz/:id',
        component: <Quiz />
    },
    {
        name: 'Quiz detail',
        path: '/quiz/detail/:id',
        component: <QuizDetail />
    },

]