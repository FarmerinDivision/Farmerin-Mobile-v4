import React, { useEffect, useState } from 'react';

const NoRegsTable = ({ html }) => {
  const [data, setData] = useState([]);
console.log('DATAAAAAA', data)
  useEffect(() => {
    const fetchData = async () => {
      const result = await parseNoRegsData(html);
      setData(result);
    };

    fetchData();
  }, [html]);

  return (
    <div>
      <h2>Datos No Registrados</h2>
      <table>
        <thead>
          <tr>
            <th>RP</th>
            <th>ERP</th>
            <th>Estado Pro</th>
            <th>Estado Rep</th>
            <th>Mensaje</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.RP || '-'}</td>
              <td>{item.ERP || '-'}</td>
              <td>{item.estPro || '-'}</td>
              <td>{item.estRep || '-'}</td>
              <td>{item.mensaje || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NoRegsTable;