// Rights.js
"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

function RetrieveRights({ right, index, onEdit, onDelete }) {
    return (
        <tr>
            <td className="py-2 px-4">{index + 1}</td>
            <td className="py-2 px-4">{right.Patient_Rights}</td>
            <td className="py-2 px-4">{right.Thai_Rights_Name}</td>
            <td className="py-2 px-4">{right.Eng_Rights_Name}</td>
            <td className="py-2 px-4">
                <button
                    onClick={() => onEdit(right)}
                    className="text-blue-500 hover:text-blue-700"
                >
                    <FontAwesomeIcon icon={faPenToSquare} />
                </button>

                <button
                    onClick={() => onDelete(right)}
                    className="text-red-500 hover:text-red-700 ml-2"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </td>
        </tr>
    );
}

export default function Rights() {
    const [rights, setRights] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [selectedRight, setSelectedRight] = useState({
        Patient_Rights: "",
        Thai_Rights_Name: "",
        Eng_Rights_Name: "",
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    ///// PAGINATION /////
    const [currentPage, setCurrentPage] = useState(1);
    const rightsPerPage = 10;
    const indexOfLastRight = currentPage * rightsPerPage;
    const indexOfFirstRight = indexOfLastRight - rightsPerPage;
    const currentRights = rights.slice(indexOfFirstRight, indexOfLastRight);
    const totalPages = Math.ceil(rights.length / rightsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        fetch("http://localhost:3001/rights")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setRights(data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    useEffect(() => {
        setSearch(search.trim());
        if (search === "") {
            fetch("http://localhost:3001/rights")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setRights(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            fetch("http://localhost:3001/rights/search/" + search, {
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
                    setRights(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [search]);

    const handleEditClick = (right) => {
        setSelectedRight(right);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/rights/update/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedRight),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setRights(data);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsEditModalOpen(false);
    };

    const handleDeleteClick = (right) => {
        setSelectedRight(right);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };

    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/rights/delete/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedRight),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setRights(data);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsDeleteModalOpen(false);
    };

    const handleCreateClick = () => {
        setSelectedRight({
            Patient_Rights: "",
            Thai_Rights_Name: "",
            Eng_Rights_Name: "",
        });
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    // เพิ่มฟังก์ชันสำหรับ handleSearch
const handleSearch = () => {
    if (search.trim() === "") {
        // กรณีที่ search ว่าง จะ fetch ข้อมูลทั้งหมด
        fetch("http://localhost:3001/rights")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setRights(data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        // Fetch ข้อมูลที่ค้นหา
        fetch("http://localhost:3001/rights/search/" + search, {
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
                setRights(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }
};

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/rights/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(selectedRight),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setRights(data);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsCreateModalOpen(false);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 pt-8 mt-8">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto px-4 pt-8 mt-8 my-20 pb-20">
            <h1 className="text-3xl font-bold mb-4">Rights</h1>
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
                    className="bg-teal-500 text-white px-4 py-2 rounded-lg ml-2 float-right"
                >
                    Add Right
                </button>
            </div>
            <table className="min-w-full bg-white table-auto border-b-4 border-teal-500 shadow-lg">
                <thead className="bg-teal-500 text-white text-left">
                    <tr>
                        <th className="py-2 px-4 border-b">No</th>
                        <th className="py-2 px-4 border-b">Patient Rights</th>
                        <th className="py-2 px-4 border-b">Thai Name</th>
                        <th className="py-2 px-4 border-b">English Name</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRights.map((right, index) => (
                        <RetrieveRights
                            key={index}
                            right={right}
                            index={indexOfFirstRight + index}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center mt-4">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 mx-1 rounded ${currentPage === index + 1
                                ? "bg-teal-500 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* Modals for Create, Edit, and Delete */}
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Edit Right</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Patient_Rights"
                                >
                                    Patient Rights
                                </label>
                                <input
                                    type="text"
                                    id="Patient_Rights"
                                    value={selectedRight.Patient_Rights}
                                    onChange={(e) =>
                                        setSelectedRight({
                                            ...selectedRight,
                                            Patient_Rights: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Thai_Rights_Name"
                                >
                                    Thai Name
                                </label>
                                <input
                                    type="text"
                                    id="Thai_Rights_Name"
                                    value={selectedRight.Thai_Rights_Name}
                                    onChange={(e) =>
                                        setSelectedRight({
                                            ...selectedRight,
                                            Thai_Rights_Name: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Eng_Rights_Name"
                                >
                                    English Name
                                </label>
                                <input
                                    type="text"
                                    id="Eng_Rights_Name"
                                    value={selectedRight.Eng_Rights_Name}
                                    onChange={(e) =>
                                        setSelectedRight({
                                            ...selectedRight,
                                            Eng_Rights_Name: e.target.value,
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
                        <h2 className="text-2xl font-bold mb-4">Delete Right</h2>
                        <p>Are you sure you want to delete {selectedRight.Patient_Rights}?</p>
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
                        <h2 className="text-2xl font-bold mb-4">Create Right</h2>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Patient_Rights"
                                >
                                    Patient Rights
                                </label>
                                <input
                                    type="text"
                                    id="Patient_Rights"
                                    onChange={(e) =>
                                        setSelectedRight({
                                            ...selectedRight,
                                            Patient_Rights: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Thai_Rights_Name"
                                >
                                    Thai Name
                                </label>
                                <input
                                    type="text"
                                    id="Thai_Rights_Name"
                                    onChange={(e) =>
                                        setSelectedRight({
                                            ...selectedRight,
                                            Thai_Rights_Name: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="Eng_Rights_Name"
                                >
                                    English Name
                                </label>
                                <input
                                    type="text"
                                    id="Eng_Rights_Name"
                                    onChange={(e) =>
                                        setSelectedRight({
                                            ...selectedRight,
                                            Eng_Rights_Name: e.target.value,
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
