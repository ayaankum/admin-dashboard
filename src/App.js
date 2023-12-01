import React, { useState, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './App.css';

const App = () => {
  const [users, setUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  const fetchData = async () => {
    const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
    const data = await response.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = users.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const toggleCheckbox = (userId) => {
    const newSelectedRows = selectedRows.includes(userId)
      ? selectedRows.filter((id) => id !== userId)
      : [...selectedRows, userId];
    setSelectedRows(newSelectedRows);
  };

  const deleteSelected = () => {
    const updatedUsers = users.filter((user) => !selectedRows.includes(user.id));
    setUsers(updatedUsers);
    setSelectedRows([]);
  };

  const startEditing = (user) => {
    setEditingUser(user);
  };

  const saveEditing = () => {
    const updatedUsers = users.map((user) =>
      user.id === editingUser.id
        ? { ...user, email: editingUser.email, role: editingUser.role }
        : user
    );
    setUsers(updatedUsers);
    setEditingUser(null);
  };

  const cancelEditing = () => {
    setEditingUser(null);
  };

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <div className="actions">
        <input
          style={{width:"40rem"}}
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={() => {
                  const allUserIds = currentItems.map((user) => user.id);
                  const newSelectedRows = selectedRows.length === allUserIds.length
                    ? []
                    : [...allUserIds];
                  setSelectedRows(newSelectedRows);
                }}
              />
            </th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems
            .filter((user) =>
              Object.values(user).some(
                (value) =>
                  typeof value === 'string' &&
                  value.toLowerCase().includes(searchTerm.toLowerCase())
              )
            )
            .map((user) => (
              <tr
                key={user.id}
                className={selectedRows.includes(user.id) ? 'selected' : ''}
              >
                <td>
                  <input
                    type="checkbox"
                    onChange={() => toggleCheckbox(user.id)}
                    checked={selectedRows.includes(user.id)}
                  />
                </td>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>
                  {editingUser && editingUser.id === user.id ? (
                    <input
                      type="text"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editingUser && editingUser.id === user.id ? (
                    <input
                      type="text"
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    />
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {editingUser && editingUser.id === user.id ? (
                    <>
                      <button className="save" onClick={saveEditing}>
                      <img style={{width:"1.5rem"}} src='save.png'/>
                      </button>
                      <button className="cancel" onClick={cancelEditing}>
                      <img style={{width:"1.5rem"}} src='cancle.png'/>
                      </button>
                    </>
                  ) : (
                    <button
                      className="edit"
                      onClick={() => startEditing(user)}
                      disabled={!!editingUser}
                    >
                      <img style={{width:"1.5rem"}} src='edit.png'/>
                    </button>
                  )}
                  <button
                    className="delete"
                    onClick={() => {
                      const updatedUsers = users.filter(
                        (currentUser) => currentUser.id !== user.id
                      );
                      setUsers(updatedUsers);
                    }}
                  >
                   <img style={{width:"1.5rem"}} src='delete.png'/>
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="pagination">

      <button style={{backgroundColor:"#45a049"}} className="delete-selected" onClick={deleteSelected}>
          Delete Selected
        </button>
        <button
          className="previous-page"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {Math.ceil(users.length / itemsPerPage)}
        </span>
        <button
          className="next-page"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === Math.ceil(users.length / itemsPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default App;
