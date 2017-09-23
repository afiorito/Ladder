import React, { Component } from 'react';
import { Modal, Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import LoadingButton from './LoadingButton';
import './EmailModal.css';

class EmailModal extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      subject: "",
      body: "",
      isSending: false
    };
  }

  validateForm() {
    return (
      this.state.body &&
      this.state.subject
    );
  }


  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = () => {
    this.setState({ isSending: true });
    this.props.sendEmail(this.state);
    this.setState({ isSending: false, subject: "", body: "" });
  }

  render() {
    const { title, showModal, closeModal } = this.props;

    return (
        <Modal show={showModal} onHide={closeModal} dialogClassName="EmailModal">
          <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FormGroup controlId="subject">
              <ControlLabel>Subject</ControlLabel>
              <FormControl
                onChange={this.handleChange}
                value={this.state.subject}
              />
            </FormGroup>
            <FormGroup controlId="body">
              <ControlLabel>Body</ControlLabel>
              <FormControl
                onChange={this.handleChange}
                value={this.state.body}
                componentClass="textarea"
              />
            </FormGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={closeModal}>Cancel</Button>
            <LoadingButton
              onClick={this.handleSubmit}
              bsStyle="primary"
              disabled={!this.validateForm()}
              type="submit"
              isLoading={this.state.isSending}
              text="Send"
              loadingText="Sending…"
            />
          </Modal.Footer>

        </Modal>
    );
  }
}

export default EmailModal;