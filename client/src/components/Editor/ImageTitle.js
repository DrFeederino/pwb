import React, { Component } from 'react';
import { FlexBox, FlexItem } from '../flex';

class ImageTitle extends Component {
    render() {
        const { title, content, action, children } = this.props;
        return children || (
            <FlexBox className="app-content-layout-title" alignItems="center" flexWrap="wrap">
                <FlexItem flex="0 1 auto">
                    <FlexBox className="app-content-layout-title-title" justifyContent="flex-start" alignItems="center">
                        {
                            title instanceof String ? (
                                <h3>{title}</h3>
                            ) : title
                        }
                    </FlexBox>
                </FlexItem>
                <FlexItem flex="auto">
                    <FlexBox className="app-content-layout-title-content" alignItems="center">
                        {content}
                    </FlexBox>
                </FlexItem>
                <FlexItem flex="auto">
                    <FlexBox className="app-content-layout-title-action" justifyContent="flex-end" alignItems="center">
                        {action}
                    </FlexBox>
                </FlexItem>
            </FlexBox>
        );
    }
}

export default ImageTitle;
