import React from 'react';
import Modal from '../common/customModal';
import Users from './users';
import Projects from './projects';
import  './menuStyle.css';


const selectDisplay = (selected) => {
  switch(selected) {
    case 'Users':
      return <Users selection={selected}/>
    case 'Projects':
      return <Projects selection={selected}/>
    default:
      return <div />
  }
}

class MainMenu extends React.Component {
    state = {
        selection: '',
        isModalOpen: false
      }
    
      handleSelection = (e) => {
        const selection = e.target.textContent;
        // this.setState({ selection});
        this.setState((state) => {return {isModalOpen: !state.isModalOpen}});
        this.setState({selection});
      }
    
      handleCloseModal = (e) => {
        this.setState((state) => {return {isModalOpen: !state.isModalOpen}});
      }
    
      render() {
        console.log(this.state)
        return (
          <div className="gear-menu">
            <div onClick={this.handleSelection}>Users</div>
            <div onClick={this.handleSelection}>Projects</div>
            <div onClick={this.handleSelection}>Worklists</div>
            <div onClick={this.handleSelection}>Annotations</div>
            <div onClick={this.handleSelection}>Templates</div>
            <div onClick={this.handleSelection}>Tools</div>
            <div onClick={this.handleSelection}>Pluginstore</div>
            <div onClick={this.handleSelection}>Connections</div>
            <div onClick={this.handleSelection}>Queries</div>
            {this.state.isModalOpen && 
            <Modal onClose={this.handleCloseModal}>
              {/* {this.selectDisplay()} */}
              {selectDisplay(this.state.selection)}
              <button onClick={this.handleCloseModal}>Close</button>
            </Modal>}
          </div>
        );
    }
}

export default MainMenu;