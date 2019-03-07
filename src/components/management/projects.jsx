import React from 'react';
import Table from 'react-table';
import './menuStyle.css';
import { getProjects } from '../../services/projectServices';
import ToolBar from './basicToolBar';

class Projects extends React.Component {

  state = {
    data: [], 
    selected: {},
    selectAll: 0
  }

  componentDidMount = () => {
    this.getProjectData();
  } 

  getProjectData = async () => {
    const result = await getProjects();
    this.setState({ data: result.data.ResultSet.Result });
  }

  toggleRow = async (id) => {
    let newSelected = Object.assign({}, this.state.selected);
    newSelected[id] = !this.state.selected[id];
    await this.setState({
      selected: newSelected,
      selectAll: 2
    });

    let values = Object.values(this.state.selected);
    if (!values.includes(true)) {
      this.setState({
        selectAll: 0
      });
    }

  }
  
  toggleSelectAll() {
		let newSelected = {};

		if (this.state.selectAll === 0) {
			this.state.data.forEach(project => {
				newSelected[project.id] = true;
			});
		}

		this.setState({
			selected: newSelected,
			selectAll: this.state.selectAll === 0 ? 1 : 0
		});
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
              checked={this.state.selected[original.id] === true}
              onChange={() => this.toggleRow(original.id)}
            />
          );
        },
        Header: x => {
          return (
            <input
              type="checkbox"
              className="checkbox"
              checked={this.state.selectAll === 1}
              ref={input => {
                if (input) {
                  input.indeterminate = this.state.selectAll === 2;
                }
              }}
              onChange={() => this.toggleSelectAll()}
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
        Cell: original => {
          // console.log(original.row.checkbox.id);
          // console.log(this.state);
          return (<p className="clickable wrapped">{original.row.loginNames.join(', ')}</p>)
        } 
        
      }, {
        Header: '',
        minWidth: 50,
        minResizeWidth: 20,
        resizable: true,

      }
    ];
  }

  render = () => {
    // console.log('projects data', this.state.data);
    return (
      <div className="projects menu-display"> 
        <ToolBar />
        <Table data={this.state.data} columns={this.defineColumns()}/>
      </div>
    );
  }
}

export default Projects;
