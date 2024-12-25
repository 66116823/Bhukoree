"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

function prepareHN(latestHN) {
    var hn = parseInt(latestHN.slice(-5)) + 1;
    return "WU" + hn;
}

function RetreivePatients({ patient, index, onEdit, onDelete }) {
    // Filter out any undefined or null values
    const rights = [
        patient.Patient_Rights_1,
        patient.Patient_Rights_2,
        patient.Patient_Rights_3,
    ].filter(Boolean);
    var no = index + 1;
    return (
        <tr>
            <td className="py-2 px-4">{no}</td>
            <td className="py-2 px-4">{patient.HN}</td>
            <td className="py-2 px-4">{patient.Name}</td>
            <td className="py-2 px-4">
                {rights.map((right, i) => (
                    <span
                        key={i}
                        className="me-2 inline-flex items-center rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                    >
                        {right}
                    </span>
                ))}
            </td>
            <td className="py-2 px-4">{patient.Chronic_Disease}</td>
            <td className="py-2 px-4">{patient.Address}</td>
            <td className="py-2 px-4">{patient.Phone}</td>
            <td className="py-2 px-4">
                <button
                    onClick={() => onEdit(patient)}
                    className="text-blue-500 hover:text-blue-700"
                >
                    <FontAwesomeIcon icon={faPenToSquare} />
                </button>

                <button
                    onClick={() => onDelete(patient)}
                    className="text-red-500 hover:text-red-700 ml-2"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </td>
        </tr>
    );
}

export default function Patients() {
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [rights, setRights] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [latestHN, setLatestHN] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    ///// PAGINATION /////
    const [currentPage, setCurrentPage] = useState(1);
    const patientsPerPage = 10;
    // Calculate the current patients to display based on pagination
    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = patients.slice(
        indexOfFirstPatient,
        indexOfLastPatient
    );
    // Calculate the total number of pages
    const totalPages = Math.ceil(patients.length / patientsPerPage);
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        fetch("http://localhost:3001/patients")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setPatients(data);
                if (data.length > 0) {
                    const hn = prepareHN(data[data.length - 1].HN);
                    setLatestHN(hn);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
        fetch("http://localhost:3001/rights")
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
    }, []);

    useEffect(() => {
        setSearch(search.trim());
        if (search === "") {
            fetch("http://localhost:3001/patients")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setPatients(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        fetch("http://localhost:3001/patients/search/" + search, {
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
                setPatients(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [search]);

    const handleEditClick = (patient) => {
        setSelectedPatient(patient);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/patients/update/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedPatient),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setPatients(data);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsEditModalOpen(false);
    };

    const handleDeleteClick = (patient) => {
        setSelectedPatient(patient);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };

    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/patients/delete/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedPatient),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setPatients(data);
            })
            .catch((err) => {
                console.log(err);
            });
        setIsDeleteModalOpen(false);
    };

    const handleCreateClick = () => {
        setSelectedPatient({ HN: latestHN });
        setIsCreateModalOpen(true);
    };
    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        console.log("New patient:", selectedPatient);
        fetch("http://localhost:3001/patients/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(selectedPatient),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setPatients(data);
                var hn = prepareHN(data[data.length - 1].HN);
                setLatestHN(hn);
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
        <div className=" container max-w-7xl mx-auto px-4 pt-8 mt-8 my-20 pb-20">
            <h1 className="text-3xl font-bold mb-4">Patients</h1>
            <div className="flex flex-row mb-4">
                <input
                    type="text"
                    className="w-96 border-2 border-teal-500 p-2 rounded-lg"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button className="bg-teal-500 text-white px-4 py-2 rounded-lg ml-2">
                    Search
                </button>
                <button
                    onClick={handleCreateClick}
                    className="bg-teal-500 text-white px-4 py-2 rounded-lg ml-2 float-right"
                >
                    Add Patient
                </button>
            </div>
            <table className=" min-w-full bg-white table-auto border-b-4 border-teal-500 shadow-lg">
                <thead className="bg-teal-500 text-white text-left p-1">
                    <tr>
                        <th className="py-2 px-4 border-b">No</th>
                        <th className="py-2 px-4 border-b">HN</th>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">Right</th>
                        <th className="py-2 px-4 border-b">Chronic Disease</th>
                        <th className="py-2 px-4 border-b">Address</th>
                        <th className="py-2 px-4 border-b">Phone</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPatients.map((patient, index) => (
                        <RetreivePatients
                            key={index}
                            patient={patient}
                            index={indexOfFirstPatient + index}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </tbody>
            </table>
            {/* Pagination */}
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

            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Edit Patient</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="hn"
                                >
                                    HN
                                </label>
                                <input
                                    type="text"
                                    id="hn"
                                    value={selectedPatient.HN}
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            HN: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                    disabled
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="name"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={selectedPatient.Name}
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            Name: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="chronic"
                                >
                                    Chronic Disease
                                </label>
                                <input
                                    type="text"
                                    id="chronic"
                                    value={selectedPatient.Chronic_Disease}
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            Chronic_Disease: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="right1"
                                >
                                    Right 1
                                </label>
                                <select
                                    id="right1"
                                    value={selectedPatient.Patient_Rights_1}
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            Patient_Rights_1: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="">Select Right</option>
                                    {rights.map((right, index) => (
                                        <option key={index} value={right.Patient_Rights}>
                                            {right.Patient_Rights}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="right1"
                                >
                                    Right 2
                                </label>
                                <select
                                    id="right2"
                                    value={selectedPatient.Patient_Rights_2}
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            Patient_Rights_2: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="">Select Right</option>
                                    {rights.map((right, index) => (
                                        <option key={index} value={right.Patient_Rights}>
                                            {right.Patient_Rights}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="right1"
                                >
                                    Right 3
                                </label>
                                <select
                                    id="right3"
                                    value={selectedPatient.Patient_Rights_3}
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            Patient_Rights_3: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="">Select Right</option>
                                    {rights.map((right, index) => (
                                        <option key={index} value={right.Patient_Rights}>
                                            {right.Patient_Rights}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="address"
                                >
                                    Address
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    value={selectedPatient.Address}
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            Address: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="phone"
                                >
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    id="phone"
                                    value={selectedPatient.Phone}
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            Phone: e.target.value,
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
                        <h2 className="text-2xl font-bold mb-4">Delete Patient</h2>
                        <p>Are you sure you want to delete {selectedPatient.HN}?</p>
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
                        <h2 className="text-2xl font-bold mb-4">Create Patient</h2>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="hn"
                                >
                                    HN
                                </label>
                                <input
                                    type="text"
                                    id="hn"
                                    value={latestHN}
                                    onChange={(e) =>
                                        setSelectedPatient({ ...selectedPatient, HN: latestHN })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    disabled
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="name"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            Name: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="chronic"
                                >
                                    Chronic Disease
                                </label>
                                <input
                                    type="text"
                                    id="chronic"
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            Chronic_Disease: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="right1"
                                >
                                    Right 1
                                </label>
                                <select
                                    id="right1"
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            Patient_Rights_1: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="">Select Right</option>
                                    {rights.map((right, index) => (
                                        <option key={index} value={right.Patient_Rights}>
                                            {right.Patient_Rights}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="right1"
                                >
                                    Right 2
                                </label>
                                <select
                                    id="right2"
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            Patient_Rights_2: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="">Select Right</option>
                                    {rights.map((right, index) => (
                                        <option key={index} value={right.Patient_Rights}>
                                            {right.Patient_Rights}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="right1"
                                >
                                    Right 3
                                </label>
                                <select
                                    id="right3"
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            Patient_Rights_3: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="">Select Right</option>
                                    {rights.map((right, index) => (
                                        <option key={index} value={right.Patient_Rights}>
                                            {right.Patient_Rights}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="address"
                                >
                                    Address
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            Address: e.target.value,
                                        })
                                    }
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="phone"
                                >
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    id="phone"
                                    onChange={(e) =>
                                        setSelectedPatient({
                                            ...selectedPatient,
                                            Phone: e.target.value,
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
