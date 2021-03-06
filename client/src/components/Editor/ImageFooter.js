import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import i18n from 'i18next';

import CommonButton from '../common/CommonButton';

class ImageFooterToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canvasRef: PropTypes.any,
      zoomRatio: PropTypes.number,
      interactionMode: 'selection'
    };
  }

  componentDidMount() {
    const { canvasRef } = this.props;
    this.waitForCanvasRender(canvasRef);
  }

  componentWillUnmount() {
    const { canvasRef } = this.props;
    this.detachEventListener(canvasRef);
  }

  waitForCanvasRender = canvas => {
    setTimeout(() => {
      if (canvas) {
        this.attachEventListener(canvas);
        return;
      }
      const { canvasRef } = this.props;
      this.waitForCanvasRender(canvasRef);
    }, 5);
  };

  attachEventListener = canvasRef => {
    canvasRef.canvas.wrapperEl.addEventListener(
      'keydown',
      this.events.keydown,
      false
    );
  };

  detachEventListener = canvasRef => {
    canvasRef.canvas.wrapperEl.removeEventListener(
      'keydown',
      this.events.keydown
    );
  };

  /* eslint-disable react/sort-comp, react/prop-types */
  handlers = {
    selection: () => {
      this.props.canvasRef.modeHandlers.selection(obj => {
        return {
          selectable: obj.superType !== 'port',
          evented: true
        };
      });
      this.setState({ interactionMode: 'selection' });
    },
    grab: () => {
      this.props.canvasRef.modeHandlers.grab();
      this.setState({ interactionMode: 'grab' });
    }
  };

  events = {
    keydown: e => {
      if (this.props.canvasRef.canvas.wrapperEl !== document.activeElement) {
        return false;
      }
      if (e.keyCode === 81) {
        this.handlers.selection();
      } else if (e.keyCode === 87) {
        this.handlers.grab();
      }
    }
  };

  render() {
    const { canvasRef, zoomRatio } = this.props;
    const { interactionMode } = this.state;
    const { selection, grab } = this.handlers;
    if (!canvasRef) {
      return null;
    }
    const zoomValue = parseInt((zoomRatio * 100).toFixed(2), 10);
    return (
      <React.Fragment>
        <div className="rde-editor-footer-toolbar-interaction">
          <Button.Group>
            <CommonButton
              type={interactionMode === 'selection' ? 'primary' : 'default'}
              style={{
                boapprBottomLeftRadius: '8px',
                boapprTopLeftRadius: '8px'
              }}
              onClick={() => {
                selection();
              }}
              icon="mouse-pointer"
              tooltipTitle={i18n.t('action.selection')}
            />
            <CommonButton
              type={interactionMode === 'grab' ? 'primary' : 'default'}
              style={{
                boapprBottomRightRadius: '8px',
                boapprTopRightRadius: '8px'
              }}
              onClick={() => {
                grab();
              }}
              tooltipTitle={i18n.t('action.grab')}
              icon="hand-rock"
            />
          </Button.Group>
        </div>
        <div className="rde-editor-footer-toolbar-zoom">
          <Button.Group>
            <CommonButton
              style={{
                boapprBottomLeftRadius: '8px',
                boapprTopLeftRadius: '8px'
              }}
              onClick={() => {
                canvasRef.zoomHandlers.zoomOut();
              }}
              icon="search-minus"
              tooltipTitle={i18n.t('action.zoom-out')}
            />
            <CommonButton
              onClick={() => {
                canvasRef.zoomHandlers.zoomOneToOne();
              }}
              tooltipTitle={i18n.t('action.one-to-one')}
            >
              {`${zoomValue}%`}
            </CommonButton>
            <CommonButton
              onClick={() => {
                canvasRef.zoomHandlers.zoomToFit();
              }}
              tooltipTitle={i18n.t('action.fit')}
              icon="expand"
            />
            <CommonButton
              style={{
                boapprBottomRightRadius: '8px',
                boapprTopRightRadius: '8px'
              }}
              onClick={() => {
                canvasRef.zoomHandlers.zoomIn();
              }}
              icon="search-plus"
              tooltipTitle={i18n.t('action.zoom-in')}
            />
          </Button.Group>
        </div>
      </React.Fragment>
    );
  }
}

export default ImageFooterToolbar;
