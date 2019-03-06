import React from 'react';
import Table from 'react-table';
import './menuStyle.css';
import { getProjects } from '../../services/projectServices';

class Projects extends React.Component {

  state = {
    data: []
  }

  componentDidMount = () => {
    this.getProjectData();
  } 

  getProjectData = async () => {
    const result = await getProjects();
    this.setState({ data: result.data.ResultSet.Result });
  }
  
  defineColumns = () => {
    return [
      {
        id: "checkbox",
        accessor: "",
        Cell: ({ original }) => {
          return (
            <input
              type="checkbox"
              className="checkbox"
              // checked={this.state.selected[original.firstName] === true}
              // onChange={() => this.toggleRow(original.firstName)}
            />
          );
        },
        Header: x => {
          return (
            <input
              type="checkbox"
              className="checkbox"
              // checked={this.state.selectAll === 1}
            //   ref={input => {
            //     if (input) {
            //       input.indeterminate = this.state.selectAll === 2;
            //     }
            //   }}
            //   onChange={() => this.toggleSelectAll()}
            />
          );
        },
        sortable: false,
        width: 45
      },
      {
        Header: 'Name',
        accessor: 'name',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: 'Open',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      }, 
      {
        Header: 'Description',
        accessor: 'description',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: 'Type',
        accessor: 'type',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: 'Users',
        accessor: 'loginNames',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => (
          <p className="clickable wrapped">{original.row.loginNames.join(', ')}</p>
        ) 
        
      }, {
        Header: '',
        minWidth: 50,
        minResizeWidth: 20,
        resizable: true,

      }
    ];
  }

  render = () => {
    console.log('projects data', this.state.data);
    return (
      <div className="projects-display"> 
        <Table data={this.state.data} columns={this.defineColumns()}/>
      </div>
    );
  }
}

export default Projects;
