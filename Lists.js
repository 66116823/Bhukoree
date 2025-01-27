"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

// ฟังก์ชันสำหรับแสดงข้อมูล Food แต่ละรายการ พร้อมปุ่มแก้ไขและลบ
function RetrieveLists({ list, index, onEdit, onDelete }) {
    return (
        <tr>
            <td className="py-2 px-4">{index + 1}</td>
            <td className="py-2 px-4">{list.Age}</td>
            <td className="py-2 px-4">{list.Occupation}</td>
            <td className="py-2 px-4">{list.Monthly_Income}</td>
            <td className="py-2 px-4">{list.latitude}</td>
            <td className="py-2 px-4">{list.longitude}</td>
            <td className="py-2 px-4">{list.Feedback}</td>
            <td className="py-2 px-4">
                
                <button
                    onClick={() => onEdit(list)}
                    className="text-blue-500 hover:text-blue-700"
                >
                    <FontAwesomeIcon icon={faPenToSquare} />
                </button>

                <button
                    onClick={() => onDelete(list)}
                    className="text-red-500 hover:text-red-700 ml-2"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </td>
        </tr>
    );
}

// คอมโพเนนต์หลักสำหรับจัดการข้อมูล Lsit
export default function Lists() {
    const [lists, setLists] = useState([]); // State สำหรับเก็บข้อมูล
    const [search, setSearch] = useState(""); // State สำหรับข้อความค้นหา
    const [loading, setLoading] = useState(true); // State สำหรับสถานะการโหลด

    // State สำหรับเก็บข้อมูลที่ถูกเลือก (แก้ไข/ลบ/สร้างใหม่)
    const [selectedList, setSelectedList] = useState({
        Age: "",
        Occupation: "",
        Monthly_Income: "",
        latitude: "",
        longitude: "",
        Feedback: "",

    });
    // State สำหรับจัดการการแสดง Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    ///// PAGINATION /////
    const [currentPage, setCurrentPage] = useState(1); // State สำหรับหน้า Pagination ปัจจุบัน
    const listsPerPage = 10; // จำนวนสิทธิ์ต่อหน้า
    const indexOfLastList = currentPage * listsPerPage; // Index ของรายการสุดท้ายในหน้า
    const indexOfFirstList = indexOfLastList - listsPerPage; // Index ของรายการแรกในหน้า
    const currentRights = lists.slice(indexOfFirstList, indexOfLastList); // ข้อมูลสิทธิ์ในหน้าปัจจุบัน
    const totalPages = Math.ceil(lists.length / listsPerPage); // จำนวนหน้าทั้งหมด

    // Logic to show only 10 pages in the pagination
    const maxPageButtons = 10; // จำนวนปุ่มสูงสุด
    const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2)); // เริ่มหน้า
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1); // หน้าสุดท้าย
    const paginationRange = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber); // อัพเดทหน้า Pagination
    };

    // useEffect สำหรับดึงข้อมูลสิทธิ์ครั้งแรก
    useEffect(() => {
        fetch("http://localhost:3001/lists")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setLists(data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    // useEffect สำหรับอัพเดทข้อมูลตามการค้นหา
    useEffect(() => {
        setSearch(search.trim()); // ตัดช่องว่างออกจากข้อความค้นหา
        if (search === "") {
            fetch("http://localhost:3001/lists")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setLists(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            // ถ้ามีข้อความค้นหา ให้ค้นหาข้อมูล
            fetch("http://localhost:3001/lists/search/" + search, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setLists(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [search]);

    // ฟังก์ชันสำหรับคลิกแก้ไข
    const handleEditClick = (list) => {
        setSelectedList(list);
        setIsEditModalOpen(true);
    };

    // ฟังก์ชันสำหรับปิด Modal แก้ไข
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    // ฟังก์ชันสำหรับบันทึกการแก้ไข
    const handleEditSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/lists/update/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedList),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setLists(data);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsEditModalOpen(false);
    };

    // ฟังก์ชันสำหรับคลิกลบ
    const handleDeleteClick = (list) => {
        setSelectedList(list);
        setIsDeleteModalOpen(true);
    };

    // ฟังก์ชันสำหรับปิด Modal ลบ
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };

    // ฟังก์ชันสำหรับยืนยันการลบ
    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/lists/delete/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedList),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setLists(data);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsDeleteModalOpen(false);
    };

    // ฟังก์ชันสำหรับคลิกเพิ่มสิทธิ์ใหม่
    const handleCreateClick = () => {
        setSelectedList({
            Age: "",
            Occupation: "",
            Monthly_Income: "",
            latitude: "",
            longitude: "",
            Feedback: "",
        });
        setIsCreateModalOpen(true);
    };

    // ฟังก์ชันสำหรับปิด Modal เพิ่มสิทธิ์ใหม่
    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    // เพิ่มฟังก์ชันสำหรับ handleSearch
const handleSearch = () => {
    if (search.trim() === "") {
        // กรณีที่ search ว่าง จะ fetch ข้อมูลทั้งหมด
        fetch("http://localhost:3001/lists")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setLists(data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        // ถ้า search มีค่า ให้ fetch ข้อมูลที่ค้นหาโดยใช้ค่า search
        fetch("http://localhost:3001/lists/search/" + search, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setLists(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }
};

    // ฟังก์ชันสำหรับการส่งข้อมูลสร้างสิทธิใหม่
    const handleCreateSubmit = (e) => {
        e.preventDefault(); // ป้องกันการ reload หน้าเว็บ
        fetch("http://localhost:3001/lists/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // ระบุประเภทของข้อมูลเป็น JSON
            },
            body: JSON.stringify(selectedList), // ส่งข้อมูล selectedList เป็น JSON
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setLists(data);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsCreateModalOpen(false);
    };

    // ตรวจสอบสถานะ loading
    if (loading) {
        return (
            <div className="container mx-auto px-4 pt-8 mt-8">
                <div>Loading...</div>
            </div>
        );
    }

    // Render ส่วนประกอบของหน้าจอ
    return (
        <div className="container max-w-7xl mx-auto px-4 pt-8 mt-8 my-20 pb-20">
            <h1 className="text-3xl font-bold mb-4">List</h1>
            <div className="flex flex-row mb-4">
                <input
                    type="text"
                    className="w-96 border-2 border-teal-500 p-2 rounded-lg"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button 
                    onClick={handleSearch} // เพิ่มการเชื่อมโยงฟังก์ชัน handleSearch
                    className="bg-teal-500 text-white px-4 py-2 rounded-lg ml-2">
                    Search
                </button>

                <button
                    onClick={handleCreateClick}
                    className="bg-teal-500 text-white px-4 py-2 rounded-lg ml-2 float-list"
                >
                    Add List
                </button>
            </div>
            <table className="min-w-full bg-white table-auto border-b-4 border-teal-500 shadow-lg">
                <thead className="bg-teal-500 text-white text-left">
                    <tr>
                        <th className="py-2 px-4 border-b">No</th>
                        <th className="py-2 px-4 border-b">Age</th>
                        <th className="py-2 px-4 border-b">Occupation</th>
                        <th className="py-2 px-4 border-b">Monthly_Income</th>
                        <th className="py-2 px-4 border-b">latitude</th>
                        <th className="py-2 px-4 border-b">longitude</th>
                        <th className="py-2 px-4 border-b">Feedback</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRights.map((list, index) => (
                        <RetrieveLists
                            key={index}
                            list={list}
                            index={indexOfFirstList + index}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center mt-4">
                {/* ปุ่มไปที่หน้าแรก */}
                {currentPage > 1 && (
                    <button
                        onClick={() => handlePageChange(1)}
                        className="px-4 py-2 mx-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                        First
                    </button>
                )}

                {/* ปุ่มก่อนหน้า */}
                {currentPage > 1 && (
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-4 py-2 mx-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                        Prev
                    </button>
                )}

                {/* แสดงเฉพาะ 10 หน้าปัจจุบัน */}
                {paginationRange.map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 mx-1 rounded ${
                            currentPage === page
                                ? "bg-teal-500 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {/* ปุ่มถัดไป */}
                {currentPage < totalPages && (
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-4 py-2 mx-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                        Next
                    </button>
                )}

                {/* ปุ่มไปที่หน้าสุดท้าย */}
                {currentPage < totalPages && (
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        className="px-4 py-2 mx-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                        Last
                    </button>
                )}
            </div>

            {/* Modals for Create, Edit, and Delete */}
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Edit Lists</h2>
                        <form onSubmit={handleEditSubmit}> {/* ฟอร์มสำหรับแก้ไขสิทธิ */}
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Age"
                                >
                                    Age
                                </label>
                                <input
                                    type="int"
                                    id="Age"
                                    value={selectedList.Age}
                                    onChange={(e) =>
                                        setSelectedList({
                                            ...selectedList,
                                            Age: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required // บังคับกรอกข้อมูล
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Occupation"
                                >
                                    Occupation
                                </label>
                                <input
                                    type="text"
                                    id="Occupation"
                                    value={selectedList.Occupation}
                                    onChange={(e) =>
                                        setSelectedList({
                                            ...selectedList,
                                            Occupation: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Monthly_Income"
                                >
                                    Monthly_Income
                                </label>
                                <input
                                    type="text"
                                    id="Monthly_Income"
                                    value={selectedList.Monthly_Income}
                                    onChange={(e) =>
                                        setSelectedList({
                                            ...selectedList,
                                            Monthly_Income: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="latitude"
                                >
                                    latitude
                                </label>
                                <input
                                    type="text"
                                    id="latitude"
                                    value={selectedList.latitude}
                                    onChange={(e) =>
                                        setSelectedList({
                                            ...selectedList,
                                            latitude: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="longitude"
                                >
                                    longitude
                                </label>
                                <input
                                    type="text"
                                    id="longitude"
                                    value={selectedList.longitude}
                                    onChange={(e) =>
                                        setSelectedList({
                                            ...selectedList,
                                            longitude: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Feedback"
                                >
                                    Feedback
                                </label>
                                <input
                                    type="text"
                                    id="Feedback"
                                    value={selectedList.Feedback}
                                    onChange={(e) =>
                                        setSelectedList({
                                            ...selectedList,
                                            Feedback: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseEditModal}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Delete List</h2>
                        <p>Are you sure you want to delete {selectedList.id}?</p>
                        <div className="flex items-center justify-between mt-4">
                            <button
                                onClick={handleDeleteSubmit}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Delete
                            </button>
                            <button
                                onClick={handleCloseDeleteModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isCreateModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Create List</h2>
                        <form onSubmit={handleCreateSubmit}>
                        <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Age"
                                >
                                    Age
                                </label>
                                <input
                                    type="int"
                                    id="Age"
                                    value={selectedList.Age}
                                    onChange={(e) =>
                                        setSelectedList({
                                            ...selectedList,
                                            Age: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required // บังคับกรอกข้อมูล
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Occupation"
                                >
                                    Occupation
                                </label>
                                <input
                                    type="text"
                                    id="Occupation"
                                    value={selectedList.Occupation}
                                    onChange={(e) =>
                                        setSelectedList({
                                            ...selectedList,
                                            Occupation: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Monthly_Income"
                                >
                                    Monthly_Income
                                </label>
                                <input
                                    type="text"
                                    id="Monthly_Income"
                                    value={selectedList.Monthly_Income}
                                    onChange={(e) =>
                                        setSelectedList({
                                            ...selectedList,
                                            Monthly_Income: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="latitude"
                                >
                                    latitude
                                </label>
                                <input
                                    type="text"
                                    id="latitude"
                                    value={selectedList.latitude}
                                    onChange={(e) =>
                                        setSelectedList({
                                            ...selectedList,
                                            latitude: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="longitude"
                                >
                                    longitude
                                </label>
                                <input
                                    type="text"
                                    id="longitude"
                                    value={selectedList.longitude}
                                    onChange={(e) =>
                                        setSelectedList({
                                            ...selectedList,
                                            longitude: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Feedback"
                                >
                                    Feedback
                                </label>
                                <input
                                    type="text"
                                    id="Feedback"
                                    value={selectedList.Feedback}
                                    onChange={(e) =>
                                        setSelectedList({
                                            ...selectedList,
                                            Feedback: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseCreateModal}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
