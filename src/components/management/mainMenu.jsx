import React from 'react';
import Modal from '../common/customModal';
import Users from './users';
import Projects from './projects';
import  './menuStyle.css';
import Header from '../common/managementHeader'



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
        this.props.closeMenu();
      }

      
      selectDisplay = () => {
        switch(this.state.selection) {
          case 'Users':
            return <Users selection={this.state.selection}/>
          case 'Projects':
            return <Projects selection={this.state.selection}/>
          default:
            return <div />
        }
      }
    
      render() {
        console.log(this.state)
        return (
          <div className="mng-menu">
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
              <Header selection={this.state.selection} onClose={this.handleCloseModal}/>
              {this.selectDisplay()}
            </Modal>}
          </div>
        );
    }
}

export default MainMenu;