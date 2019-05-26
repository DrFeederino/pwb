import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { Button, Modal, Form, Col, Row, Input } from 'antd';
import i18n from 'i18next';
import Icon from './Icon';

class IconChooser extends Component {
  handlers = {
    onOk: () => {
      const { icon } = this.state;
      const { onChange } = this.props;
      if (onChange) {
        onChange(icon);
      }
      this.setState({
        visible: false
      });
    },
    onCancel: () => {
      this.modalHandlers.onHide();
    },
    onClick: () => {
      this.modalHandlers.onShow();
    },
    onClickIcon: icon => {
      this.setState(
        {
          icon
        },
        () => {
          const { onChange } = this.props;
          if (onChange) {
            onChange(icon);
          }
          this.modalHandlers.onHide();
        }
      );
    },
    onSearch: debounce(value => {
      this.setState({
        textSearch: value
      });
    }, 500)
  };

  modalHandlers = {
    onShow: () => {
      this.setState({
        visible: true
      });
    },
    onHide: () => {
      this.setState({
        visible: false
      });
    }
  };

  static propTypes = {
    onChange: PropTypes.func,
    icon: PropTypes.any
  };

  static defaultProps = {
    icon: { 'map-marker-alt': '' }
  };

  state = {
    icon: this.props.icon,
    textSearch: '',
    visible: false
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      icon: nextProps.icon || this.state.icon
    });
  }

  getPrefix = style => {
    let prefix = 'fas';
    if (style === 'brands') {
      prefix = 'fab';
    } else if (style === 'regular') {
      prefix = 'far';
    }
    return prefix;
  };

  render() {
    const { onOk, onCancel, onClick, onClickIcon, onSearch } = this.handlers;
    const { icon, visible, textSearch } = this.state;
    const label = (
      <React.Fragment>
        <span style={{ marginRight: 8 }}>{i18n.t('common.icon')}</span>
        <Icon
          name={Object.keys(icon)[0]}
          prefix={this.getPrefix(icon[Object.keys(icon)[0]].styles[0])}
        />
      </React.Fragment>
    );
    const filteredIcons = this.getIcons(textSearch);
    const filteredIconsLength = filteredIcons.length;
    const title = (
      <div style={{ padding: '0 24px' }}>
        <Input
          onChange={e => {
            onSearch(e.target.value);
          }}
          placeholder={i18n.t('imagemap.marker.search-icon', {
            length: filteredIconsLength
          })}
        />
      </div>
    );
    return (
      <React.Fragment>
        <Form.Item label={label} colon={false}>
          <Button onClick={onClick}>
            {i18n.t('imagemap.marker.choose-icon')}
          </Button>
        </Form.Item>
        <Modal
          onOk={onOk}
          onCancel={onCancel}
          width="80%"
          visible={visible}
          title={title}
          bodyStyle={{ margin: 16, overflowY: 'auto', height: '600px' }}
        >
          <Row>
            {filteredIcons.map(ic => {
              const name = Object.keys(ic)[0];
              const metadata = ic[name];
              const prefix = this.getPrefix(metadata.styles[0]);
              return (
                <Col
                  onClick={onClickIcon.bind(this, ic)}
                  key={name}
                  span={4}
                  className="rde-icon-container"
                >
                  <div className="rde-icon-top">
                    <Icon name={name} size={3} prefix={prefix} />
                  </div>
                  <div className="rde-icon-bottom">{name}</div>
                </Col>
              );
            })}
          </Row>
        </Modal>
      </React.Fragment>
    );
  }
}

export default IconChooser;
