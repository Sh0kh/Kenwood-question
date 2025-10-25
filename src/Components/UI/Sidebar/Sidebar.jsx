import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Card, Typography } from "@material-tailwind/react";

export default function Sidebar({ active, open }) {

    const groupedMenuItems = [
        {
            section: "Asosiy",
            items: [
                {
                    id: 1,
                    title: "Savollar yaratish",
                    path: "/",
                    icon: (
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 14a1 1 0 1 0 0 2a1 1 0 0 0 0-2m0-9.5a3.625 3.625 0 0 0-3.625 3.625a1 1 0 1 0 2 0a1.625 1.625 0 1 1 2.23 1.51c-.676.27-1.605.962-1.605 2.115V14a1 1 0 1 0 2 0c0-.244.05-.366.261-.47l.087-.04A3.626 3.626 0 0 0 12 6.5"></path></g></svg>
                    ),
                },
                {
                    id: 1,
                    title: "Klientlar",
                    path: "/client",
                    icon: (
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24"><path fill="currentColor" d="M16 17v2H2v-2s0-4 7-4s7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.4 3.4 0 0 0-1.93.59a5 5 0 0 1 0 5.82A3.4 3.4 0 0 0 15 11a3.5 3.5 0 0 0 0-7"></path></svg>),
                }
            ],
        },
    ];


    return (
        <Card
            className={`h-[95%] fixed top-[15px] left-[15px] z-50 shadow-xl bg-white/30 backdrop-blur-md border border-white/20 px-4 py-6 overflow-y-auto flex flex-col justify-between transition-all duration-500
        ${open ? "w-[100px]" : "w-[280px]"}`}
        >
            <div>
                {/* Кнопка открытия/закрытия */}
                <div className="flex items-center justify-between mb-6">
                    <div>

                    </div>
                    <button
                        onClick={active}
                        className="p-2 rounded-lg hover:bg-white/40 transition"
                        title="Toggle sidebar"
                    >
                        {!open ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Меню */}
                <div className="flex flex-col gap-6">
                    {groupedMenuItems.map((group) => (
                        <div key={group.section}>
                            {!open && (
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="mb-2 uppercase font-medium text-xs tracking-widest"
                                >
                                    {group.section}
                                </Typography>
                            )}
                            <div className="flex flex-col gap-2">
                                {group.items.map((item) => (
                                    <NavLink
                                        key={item.id}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center ${open && "justify-center"} gap-3 w-full px-4 py-3 rounded-lg transition-all duration-300
                                            ${isActive
                                                ? "bg-white/80 text-[#4DA057] font-semibold shadow-md"
                                                : "text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3]"
                                            }`
                                        }
                                    >
                                        <span className="w-6 h-6">{item.icon}</span>
                                        {!open && <span className="text-sm">{item.title}</span>}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
