import React, { Component } from 'react';
import { Badge, Button, Menu } from 'antd';
import i18n from 'i18next';

import Canvas from '../canvas/Canvas';
import ImageFooterToolbar from './ImageFooter';
import ImageItems from './ImageItems';
import ImageTitle from './ImageTitle';
import ImageHeaderToolbar from './ImageHeader';
import ImageConfigurations from './ImageConfig';

import '@fortawesome/fontawesome-free/css/all.css';
import '../../styles/index.css';
import Container from '../common/Container';

const propertiesToInclude = [
  'id',
  'name',
  'lock',
  'file',
  'src',
  'link',
  'tooltip',
  'animation',
  'layout',
  'workareaWidth',
  'workareaHeight',
  'shadow',
  'muted',
  'loop',
  'code',
  'icon',
  'userProperty',
  'trigger',
  'configuration',
  'superType',
  'points'
];

const defaultOptions = {
  fill: 'rgba(0, 0, 0, 1)',
  stroke: 'rgba(255, 255, 255, 0)'
};

class ImageEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItem: null,
      zoomRatio: 1,
      canvasRect: {
        width: 0,
        height: 0
      },
      loading: false,
      editing: false,
      descriptors: {},
      darkTheme: false
    };
  }

  componentDidMount() {
    this.showLoading(true);
    import('./Descriptors.json').then(descriptors => {
      descriptors = descriptors.default;
      this.setState(
        {
          descriptors
        },
        () => {
          this.showLoading(false);
        }
      );
    });
    const { canvasRect: currentCanvasRect } = this.state;
    const canvasRect = Object.assign({}, currentCanvasRect, {
      width: 500,
      height: 500
    });
    this.setState({ canvasRect });
  }
  onChangeTheme = () => {
    this.setState({
      darkTheme: !this.state.darkTheme
    });
  };
  canvasHandlers = {
    onAdd: target => {
      if (!this.state.editing) {
        this.changeEditing(true);
      }
      if (target.type === 'activeSelection') {
        this.canvasHandlers.onSelect(null);
        return;
      }
      this.canvasRef.handlers.select(target);
    },
    onSelect: target => {
      if (
        target &&
        target.id &&
        target.id !== 'workarea' &&
        target.type !== 'activeSelection'
      ) {
        if (
          this.state.selectedItem &&
          target.id === this.state.selectedItem.id
        ) {
          return;
        }
        this.setState({
          selectedItem: target
        });
        return;
      }
      this.setState({
        selectedItem: null
      });
    },
    onRemove: target => {
      if (!this.state.editing) {
        this.changeEditing(true);
      }
      this.canvasHandlers.onSelect(null);
    },
    onChange: (selectedItem, changedValues, allValues) => {
      if (!this.state.editing) {
        this.changeEditing(true);
      }
      const changedKey = Object.keys(changedValues)[0];
      const changedValue = changedValues[changedKey];
      if (allValues.workarea) {
        this.canvasHandlers.onChangeWokarea(
          changedKey,
          changedValue,
          allValues.workarea
        );
        return;
      }
      if (changedKey === 'width' || changedKey === 'height') {
        this.canvasRef.handlers.scaleToResize(
          allValues.width,
          allValues.height
        );
        return;
      }
      if (changedKey === 'lock') {
        this.canvasRef.handlers.setObject({
          lockMovementX: changedValue,
          lockMovementY: changedValue,
          hasControls: !changedValue,
          hoverCursor: changedValue ? 'pointer' : 'move',
          editable: !changedValue,
          lock: changedValue
        });
        return;
      }
      if (
        changedKey === 'file' ||
        changedKey === 'src' ||
        changedKey === 'code'
      ) {
        if (selectedItem.type === 'image') {
          this.canvasRef.handlers.setImageById(selectedItem.id, changedValue);
        } else if (this.canvasRef.handlers.isElementType(selectedItem.type)) {
          this.canvasRef.elementHandlers.setById(selectedItem.id, changedValue);
        }
        return;
      }
      if (changedKey === 'icon') {
        const { unicode, styles } = changedValue[Object.keys(changedValue)[0]];
        const uni = parseInt(unicode, 16);
        if (styles[0] === 'brands') {
          this.canvasRef.handlers.set('fontFamily', 'Font Awesome 5 Brands');
        } else if (styles[0] === 'regular') {
          this.canvasRef.handlers.set('fontFamily', 'Font Awesome 5 Regular');
        } else {
          this.canvasRef.handlers.set('fontFamily', 'Font Awesome 5 Free');
        }
        this.canvasRef.handlers.set('text', String.fromCodePoint(uni));
        this.canvasRef.handlers.set('icon', changedValue);
        return;
      }
      if (changedKey === 'shadow') {
        if (allValues.shadow.enabled) {
          this.canvasRef.handlers.setShadow(changedKey, allValues.shadow);
        } else {
          this.canvasRef.handlers.setShadow(changedKey, null);
        }
        return;
      }
      if (changedKey === 'fontWeight') {
        this.canvasRef.handlers.set(
          changedKey,
          changedValue ? 'bold' : 'normal'
        );
        return;
      }
      if (changedKey === 'fontStyle') {
        this.canvasRef.handlers.set(
          changedKey,
          changedValue ? 'italic' : 'normal'
        );
        return;
      }
      if (changedKey === 'textAlign') {
        this.canvasRef.handlers.set(changedKey, Object.keys(changedValue)[0]);
        return;
      }
      this.canvasRef.handlers.set(changedKey, changedValue);
    },
    onChangeWokarea: (changedKey, changedValue, allValues) => {
      if (changedKey === 'layout') {
        this.canvasRef.workareaHandlers.setLayout(changedValue);
        return;
      }
      if (changedKey === 'file' || changedKey === 'src') {
        this.canvasRef.workareaHandlers.setImage(changedValue);
        return;
      }
      if (changedKey === 'width' || changedKey === 'height') {
        this.canvasRef.handlers.originScaleToResize(
          this.canvasRef.workarea,
          allValues.width,
          allValues.height
        );
        this.canvasRef.canvas.centerObject(this.canvasRef.workarea);
        return;
      }
      this.canvasRef.workarea.set(changedKey, changedValue);
      this.canvasRef.canvas.requestRenderAll();
    },
    onTooltip: (ref, target) => {
      const value = Math.random() * 10 + 1;
      return (
        <div>
          <div>
            <div>
              <Button>{target.id}</Button>
            </div>
            <Badge count={value} />
          </div>
        </div>
      );
    },
    onLink: target => {
      const { link } = target;
      if (link.state === 'current') {
        document.location.href = link.url;
        return;
      }
      window.open(link.url);
    },
    onContext: (ref, event, target) => {
      const { darkTheme } = this.state;
      if ((target && target.id === 'workarea') || !target) {
        const { layerX: left, layerY: top } = event;
        return (
          <Menu theme={darkTheme ? 'dark' : 'light'}>
            <Menu.SubMenu
              key="add"
              style={{ width: 120 }}
              title={i18n.t('action.add')}
            >
              {this.transformList().map(item => {
                const option = Object.assign({}, item.option, { left, top });
                const newItem = Object.assign({}, item, { option });
                return (
                  <Menu.Item style={{ padding: 0 }} key={item.name}>
                    {this.itemsRef.renderItem(newItem, false)}
                  </Menu.Item>
                );
              })}
            </Menu.SubMenu>
          </Menu>
        );
      }
      if (target.type === 'activeSelection') {
        return (
          <Menu>
            <Menu.Item
              onClick={() => {
                this.canvasRef.handlers.toGroup();
              }}
            >
              {i18n.t('action.object-group')}
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                this.canvasRef.handlers.duplicate();
              }}
            >
              {i18n.t('action.clone')}
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                this.canvasRef.handlers.remove();
              }}
            >
              {i18n.t('action.delete')}
            </Menu.Item>
          </Menu>
        );
      }
      if (target.type === 'group') {
        return (
          <Menu>
            <Menu.Item
              onClick={() => {
                this.canvasRef.handlers.toActiveSelection();
              }}
            >
              {i18n.t('action.object-ungroup')}
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                this.canvasRef.handlers.duplicate();
              }}
            >
              {i18n.t('action.clone')}
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                this.canvasRef.handlers.remove();
              }}
            >
              {i18n.t('action.delete')}
            </Menu.Item>
          </Menu>
        );
      }
      return (
        <Menu>
          <Menu.Item
            onClick={() => {
              this.canvasRef.handlers.duplicateById(target.id);
            }}
          >
            {i18n.t('action.clone')}
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              this.canvasRef.handlers.removeById(target.id);
            }}
          >
            {i18n.t('action.delete')}
          </Menu.Item>
        </Menu>
      );
    }
  };
  share = () => {
    const image = this.canvasRef.handlers.getImage();
  };
  transformList = () => {
    return Object.values(this.state.descriptors).reduce(
      (prev, curr) => prev.concat(curr),
      []
    );
  };

  showLoading = loading => {
    this.setState({
      loading
    });
  };

  changeEditing = editing => {
    this.setState({
      editing
    });
  };
  render() {
    const {
      selectedItem,
      canvasRect,
      zoomRatio,
      loading,
      editing,
      descriptors,
      darkTheme
    } = this.state;
    const {
      onAdd,
      onRemove,
      onSelect,
      onModified,
      onChange,
      onZoom,
      onTooltip,
      onLink,
      onContext
    } = this.canvasHandlers;
    const titleContent = (
      <React.Fragment>
        <span>{i18n.t('imagemap.imagemap-editor')}</span>
      </React.Fragment>
    );
    const title = (
      <ImageTitle
        title={titleContent}
        isDark={darkTheme}
        handleLogout={this.props.handleLogout}
        username={this.props.user.username}
      />
    );
    const content = (
      <div className={'rde-editor' + (darkTheme ? ' dark' : '')}>
        <ImageItems
          ref={c => {
            this.itemsRef = c;
          }}
          canvasRef={this.canvasRef}
          descriptors={descriptors}
        />
        <div className="rde-editor-canvas-container">
          <div className="rde-editor-header-toolbar">
            <ImageHeaderToolbar
              canvasRef={this.canvasRef}
              selectedItem={selectedItem}
              onSelect={onSelect}
              isDark={darkTheme}
              onChange={this.onChangeTheme}
              share={this.share}
            />
          </div>
          <div
            ref={c => {
              this.container = c;
            }}
            className="rde-editor-canvas"
          >
            <Canvas
              ref={c => {
                this.canvasRef = c;
              }}
              canvasOption={{
                backgroundColor: '#fff',
                selection: true,
                height: canvasRect.height,
                width: canvasRect.width
              }}
              minZoom={30}
              defaultOptions={defaultOptions}
              propertiesToInclude={propertiesToInclude}
              onModified={onModified}
              onAdd={onAdd}
              onRemove={onRemove}
              onSelect={onSelect}
              onZoom={onZoom}
              onTooltip={onTooltip}
              onLink={onLink}
              onContext={onContext}
            />
          </div>
          <div className="rde-editor-footer-toolbar">
            <ImageFooterToolbar
              canvasRef={this.canvasRef}
              zoomRatio={zoomRatio}
            />
          </div>
        </div>
        <ImageConfigurations
          canvasRef={this.canvasRef}
          onChange={onChange}
          selectedItem={selectedItem}
        />
      </div>
    );
    return (
      <Container
        title={title}
        content={content}
        loading={loading}
        className="rde-main"
      />
    );
  }
}

export default ImageEditor;
