/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component, Fragment } from 'react';

import {
  EuiButtonEmpty,
  EuiPopover,
  EuiContextMenu,
  EuiIcon,
  EuiToolTip
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';

export class LayerTocActions extends Component {

  state = {
    isPopoverOpen: false,
    supportsFitToBounds: false,
  };

  componentDidMount() {
    this._isMounted = true;
    this._loadSupportsFitToBounds();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async _loadSupportsFitToBounds() {
    const supportsFitToBounds = await this.props.layer.supportsFitToBounds();
    if (this._isMounted) {
      this.setState({ supportsFitToBounds });
    }
  }

  _togglePopover = () => {
    this.setState(prevState => ({
      isPopoverOpen: !prevState.isPopoverOpen,
    }));
  };

  _closePopover = () => {
    this.setState(() => ({
      isPopoverOpen: false
    }));
  };

  _renderPopoverToggleButton() {
    const { icon, tooltipContent, areResultsTrimmed } = this.props.layer.getIconAndTooltipContent(this.props.zoom);
    const infoButton = areResultsTrimmed ? (<EuiIcon
      color="subdued"
      type="iInCircle"
    />) : null;
    const tooltip = <Fragment>{infoButton} {tooltipContent}</Fragment>;
    return (
      <EuiToolTip
        anchorClassName="mapLayTocActions__tooltipAnchor"
        position="top"
        title={this.props.displayName}
        content={tooltip}
      >
        <EuiButtonEmpty
          className="mapTocEntry__layerName eui-textLeft"
          size="xs"
          flush="left"
          color="text"
          onClick={this._togglePopover}
          data-test-subj={`layerTocActionsPanelToggleButton${this.props.escapedDisplayName}`}
        >
          <span className="mapTocEntry__layerNameIcon">{icon}</span>
          {this.props.displayName}{infoButton}
        </EuiButtonEmpty>

      </EuiToolTip>
    );
  }

  _getActionsPanel() {
    const actionItems = [
      {
        name: i18n.translate('xpack.maps.layerTocActions.fitToDataTitle', {
          defaultMessage: 'Fit to data',
        }),
        icon: (
          <EuiIcon
            type="search"
            size="m"
          />
        ),
        'data-test-subj': 'fitToBoundsButton',
        toolTipContent: this.state.supportsFitToBounds ? null : i18n.translate('xpack.maps.layerTocActions.noFitSupportTooltip', {
          defaultMessage: 'Layer does not support fit to data',
        }),
        disabled: !this.state.supportsFitToBounds,
        onClick: () => {
          this._closePopover();
          this.props.fitToBounds();
        },
      },
      {
        name: this.props.layer.isVisible() ? i18n.translate('xpack.maps.layerTocActions.hideLayerTitle', {
          defaultMessage: 'Hide layer',
        }) : i18n.translate('xpack.maps.layerTocActions.showLayerTitle', {
          defaultMessage: 'Show layer',
        }),
        icon: (
          <EuiIcon
            type={this.props.layer.isVisible() ? 'eye' : 'eyeClosed'}
            size="m"
          />
        ),
        'data-test-subj': 'layerVisibilityToggleButton',
        onClick: () => {
          this._closePopover();
          this.props.toggleVisible();
        }
      }
    ];

    if (!this.props.isReadOnly) {
      actionItems.push({
        name: i18n.translate('xpack.maps.layerTocActions.editLayerTitle', {
          defaultMessage: 'Edit layer',
        }),
        icon: (
          <EuiIcon
            type="pencil"
            size="m"
          />
        ),
        'data-test-subj': 'editLayerButton',
        onClick: () => {
          this._closePopover();
          this.props.editLayer();
        }
      });
      actionItems.push({
        name: i18n.translate('xpack.maps.layerTocActions.cloneLayerTitle', {
          defaultMessage: 'Clone layer',
        }),
        icon: (
          <EuiIcon
            type="copy"
            size="m"
          />
        ),
        'data-test-subj': 'cloneLayerButton',
        onClick: () => {
          this._closePopover();
          this.props.cloneLayer();
        }
      });
    }

    return {
      id: 0,
      title: i18n.translate('xpack.maps.layerTocActions.layerActionsTitle', {
        defaultMessage: 'Layer actions',
      }),
      items: actionItems,
    };
  }

  render() {
    return (
      <EuiPopover
        id="contextMenu"
        className="mapLayTocActions"
        button={this._renderPopoverToggleButton()}
        isOpen={this.state.isPopoverOpen}
        closePopover={this._closePopover}
        panelPaddingSize="none"
        withTitle
        anchorPosition="leftUp"
        anchorClassName="mapLayTocActions__popoverAnchor"
      >
        <EuiContextMenu
          initialPanelId={0}
          panels={[this._getActionsPanel()]}
          data-test-subj={`layerTocActionsPanel${this.props.escapedDisplayName}`}
        />
      </EuiPopover>);
  }
}
