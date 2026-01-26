'use client'
import React, { Fragment, useEffect, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { adminMenuList, userMenuList } from "@/utils/fackData/menuList";
import getIcon from "@/utils/getIcon";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from '@/context/AuthProvider';

const Menus = () => {
    const { role } = useAuth();
    const [menuItems, setMenuItems] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [openSubDropdown, setOpenSubDropdown] = useState(null);
    const [activeParent, setActiveParent] = useState("");
    const [activeChild, setActiveChild] = useState("");
    const pathName = usePathname();

    useEffect(() => {
        if (role === 'participant') {
            setMenuItems(userMenuList);
        } else {
            setMenuItems(adminMenuList);
        }
    }, [role]);

    const handleMainMenu = (e, name) => {
        if (openDropdown === name) {
            setOpenDropdown(null);
        } else {
            setOpenDropdown(name);
        }
    };

    const handleDropdownMenu = (e, name) => {
        e.stopPropagation();
        if (openSubDropdown === name) {
            setOpenSubDropdown(null);
        } else {
            setOpenSubDropdown(name);
        }
    };

    useEffect(() => {
        if (pathName !== "/") {
            const x = pathName.split("/");
            setActiveParent(x[1]);
            setActiveChild(x[2]);
            setOpenDropdown(x[1]);
            setOpenSubDropdown(x[2]);
        } else {
            setActiveParent("dashboards");
            setOpenDropdown("dashboards");
        }
    }, [pathName]);

    return (
        <>
            {menuItems.map(({ dropdownMenu, id, name, path, icon }) => {
                return (
                    <li
                        key={id}
                        onClick={(e) => handleMainMenu(e, name.split(' ')[0])}
                        className={`nxl-item nxl-hasmenu ${activeParent === name.split(' ')[0] ? "active nxl-trigger" : ""}`}
                    >
                        <Link href={path} className="nxl-link text-capitalize">
                            <span className="nxl-micon"> {getIcon(icon)} </span>
                            <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
                                {name}
                            </span>
                            {dropdownMenu.length > 0 && (
                                <span className="nxl-arrow fs-16">
                                    <FiChevronRight />
                                </span>
                            )}
                        </Link>
                        {dropdownMenu.length > 0 && (
                            <ul className={`nxl-submenu ${openDropdown === name.split(' ')[0] ? "nxl-menu-visible" : "nxl-menu-hidden"}`}>
                                {dropdownMenu.map(({ id, name, path, subdropdownMenu, target, disabled }) => {
                                    const x = name;
                                    return (
                                        <Fragment key={id}>
                                            {subdropdownMenu && subdropdownMenu.length ? (
                                                <li
                                                    className={`nxl-item nxl-hasmenu ${activeChild === name ? "active" : ""}`}
                                                    onClick={(e) => handleDropdownMenu(e, x)}
                                                >
                                                    <Link href={path} className={`nxl-link text-capitalize`}>
                                                        <span className="nxl-mtext">{name}</span>
                                                        <span className="nxl-arrow">
                                                            <i>
                                                                {" "}
                                                                <FiChevronRight />
                                                            </i>
                                                        </span>
                                                    </Link>
                                                    {subdropdownMenu.map(({ id, name, path }) => {
                                                        return (
                                                            <ul
                                                                key={id}
                                                                className={`nxl-submenu ${openSubDropdown === x
                                                                    ? "nxl-menu-visible"
                                                                    : "nxl-menu-hidden "
                                                                    }`}
                                                            >
                                                                <li
                                                                    className={`nxl-item ${pathName === path ? "active" : ""
                                                                        }`}
                                                                >
                                                                    <Link
                                                                        className="nxl-link text-capitalize"
                                                                        href={path}
                                                                    >
                                                                        {name}
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        );
                                                    })}
                                                </li>
                                            ) : (
                                                <li className={`nxl-item ${pathName === path ? "active" : ""} ${disabled ? "disabled" : ""}`}>
                                                    {disabled ? (
                                                        <span 
                                                            className="nxl-link text-muted" 
                                                            style={{ 
                                                                cursor: 'not-allowed', 
                                                                opacity: 0.6,
                                                                pointerEvents: 'none'
                                                            }}
                                                            title="Fitur sedang dalam pengembangan"
                                                        >
                                                            {name}
                                                            <span className="badge bg-soft-warning text-warning ms-2" style={{ fontSize: '10px' }}>
                                                                Coming Soon
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <Link className="nxl-link" href={path} target={target}>
                                                            {name}
                                                        </Link>
                                                    )}
                                                </li>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </ul>
                        )}
                    </li>
                );
            })}
        </>
    );
};

export default Menus;
