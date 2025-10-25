import { Outlet } from "react-router-dom";
import Sidebar from "../Components/UI/Sidebar/Sidebar";
import { useState } from "react";

export default function AdminLayout() {
    const [active, setActive] = useState(false); // true = открыт сайдбар

    return (
        <div className="flex w-full overflow-hidden bg-[#FAFAFA] relative">
            <Sidebar active={() => setActive(!active)} open={active} />
            <div
                className={`mt-[0px] pb-[30px] px-[15px] min-h-screen transition-all duration-300`}
                style={{
                    marginLeft: !active ? "310px" : "110px",
                    width: !active ? "calc(100% - 320px)" : "100%",
                }}
            >
                <Outlet />
            </div>
        </div>
    );
}
