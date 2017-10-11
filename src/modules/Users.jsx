import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField'
import Table, {
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from 'material-ui/Table';
import { FormControlLabel } from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import Input, { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Select from 'material-ui/Select';

import { LinearProgress } from 'material-ui/Progress';
import ListIcon from 'material-ui-icons/List';
import DeleteIcon from 'material-ui-icons/Delete';
import WarningIcon from 'material-ui-icons/Warning';

import { DialogContentText } from 'material-ui/Dialog';
import DialogWithButtons from '../components/DialogWithButtons';

import NumberFormat from 'react-number-format';

import rest from '../utils/rest';

// Here we 'connect' the component to the Redux store. This means that the component will receive
// parts of the Redux store as its props. Exactly which parts is chosen by mapStateToProps.

// We should map only necessary values as props, in order to avoid unnecessary re-renders. In this
// case we need the list of users, as returned by the REST API. The component will be able to access
// the users list via `this.props.users`. Additionally, we need details about the selected user,
// which will be available as `this.props.userDetails`.

// The second function (mapDispatchToProps) allows us to 'make changes' to the Redux store, by
// dispatching Redux actions. The functions we define here will be available to the component as
// props, so in our example the component will be able to call `this.props.refresh()` in order to
// refresh the users list, and `this.props.refreshUser(user)` to fetch more info about a specific
// user.

// More details: https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options

// The injectIntl decorator makes this.props.intl.formatMessage available to the component, which
// is used for localization.

const mapStateToProps = state => ({
  users: state.users,
  usersLoading: state.users.loading,
  userDetails: state.userDetails,
});

const mapDispatchToProps = dispatch => ({

  /**
   * Refresh the user list
   *
   * @return {void}
   */
  refresh: () => {
    dispatch(rest.actions.users());
  },

  /**
   * Refresh a spcific user
   *
   * @param  {Object} user The user to be refreshed
   * @return {void}
   */
  refreshUser: user => {
    dispatch(rest.actions.userDetails({ userId: user.id }));
  },

  /**
   * Delete a spcific user
   *
   * @param  {object} user The to be deleted user
   * @return {void}
   */
  deleteUser: (user) => {
      dispatch(rest.actions.userDetails.delete({ userId: user.id }, null, () => {
          dispatch(rest.actions.users());
      }));
  },

  /**
   * Bans the user
   *
   * @param  {object} user    The to be banned user
   * @param  {object} banInfo The information about the ban
   * @return {void}
   */
  banUser: (user, banInfo) => {
    const info = {
      reason: banInfo.reason,
      expire: banInfo.expire.amount === '' || banInfo.expire.indicator === '' ? 'x' : banInfo.expire.amount + ':' + banInfo.expire.indicator
    }

    dispatch(rest.actions.banUser({ userId: user.id }, {
        body: JSON.stringify(info)
      }, () => {
        dispatch(rest.actions.users());
      }))
  },

  /**
   * Activate the user
   * @param  {object} user    The the be activated user
   * @param  {boolean} checked true: the user is activated|false: the user is not activated
   * @return {void}
   */
  activateUser: (user, checked) => {
    dispatch(rest.actions.userDetails.patch({ userId: user.id }, { body: JSON.stringify({active: checked})}, () => {
      dispatch(rest.actions.users());
    }))
  }
});

export class Users extends React.Component {
  // Component initial state.
  // Here we keep track of whether the user details dialog is open.
  state = {
    dialogOpen: false,
    deleteUserDialogOpen: false,
    toBeDeletedUser: null,
    banUserDialogOpen: false,
    toBeBannedUser: null,
    banInfo: {
      reason: '',
      expire: {
        amount: '',
        indicator: '',
      },
    }
  };

  // Refresh user list when component is first mounted
  componentDidMount() {
    const { refresh } = this.props;

    refresh();
  }

  renderProgressBar() {
    const { usersLoading } = this.props;
    return usersLoading
      ? <div style={{ marginBottom: '-5px' }}>
          <LinearProgress />
        </div>
      : null;
  }

  /**
   * Open the delete user modal
   *
   * @param  {object} user The to be deleted user
   * @return {void}
   */
  openDeleteModal = (user) => {
    this.setState({
        deleteUserDialogOpen: true,
        toBeDeletedUser: user
    });
  }

  /**
   * Open the ban user modal
   *
   * @param  {object} user the to be banned user
   * @return {void}
   */
  openBanModal = (user) => {
    this.setState({
      banUserDialogOpen: true,
      toBeBannedUser: user
    })
  }

  renderUserDetailsDesc = () =>
    <div>
      <DialogContentText>
        <b>
          {this.props.intl.formatMessage({ id: 'userId' })}
        </b>
        {`: ${this.props.userDetails.data.id}`}
      </DialogContentText>
      <DialogContentText>
        <b>
          {this.props.intl.formatMessage({ id: 'username' })}
        </b>
        {`: ${this.props.userDetails.data.username}`}
      </DialogContentText>
      <DialogContentText>
        <b>
          {this.props.intl.formatMessage({ id: 'email' })}
        </b>
        {`: ${this.props.userDetails.data.email}`}
      </DialogContentText>
      <DialogContentText>
        <b>
          {this.props.intl.formatMessage({ id: 'status' })}
        </b>
        {`: ${this.props.userDetails.data.status}`}
      </DialogContentText>
      <DialogContentText>
        <b>
          {this.props.intl.formatMessage({ id: 'createdAt' })}
        </b>
        {`: ${this.props.userDetails.data.createdAt}`}
      </DialogContentText>
      <DialogContentText>
        <b>
          {this.props.intl.formatMessage({ id: 'description' })}
        </b>
        {`: ${this.props.userDetails.data.description}`}
      </DialogContentText>
    </div>;

  /**
   * Render the user delete dialog description
   *
   * @return {Node}
   */
  renderUserDeleteDesc = () =>
    <div>
        <DialogContentText>
            <strong>
                {this.props.intl.formatMessage({ id: 'deleteUser_description' })}
            </strong>
        </DialogContentText>
    </div>;

  renderUserBanDesc = () =>
    <div style={{display: 'flex'}}>
      <FormControl>
          <InputLabel htmlFor="expire-time">{this.props.intl.formatMessage({ id: 'banUser_amount' })}</InputLabel>
          <Input id="expire-time"
            onChange={(event) => {
              this.setState({ banInfo: {...this.state.banInfo, expire: {...this.state.banInfo.expire, amount: event.target.value}} })}
            }
            inputComponent={NumberFormat}
             />
           <FormHelperText>{this.props.intl.formatMessage({ id: 'banUser_choose'})}</FormHelperText>
        </FormControl>
        <FormControl>
          <InputLabel htmlFor="expire-indicator">{this.props.intl.formatMessage({ id: 'banUser_indicator' })}</InputLabel>
          <Select
            value={this.state.banInfo.expire.indicator}
            onChange={(event) => this.setState({ banInfo: {...this.state.banInfo, expire: {...this.state.banInfo.expire, indicator: event.target.value}} })}
            input={<Input id="expire-indicator" />}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="hours">{this.props.intl.formatMessage({ id: 'banUser_indicator_hours' })}</MenuItem>
            <MenuItem value="days">{this.props.intl.formatMessage({ id: 'banUser_indicator_days' })}</MenuItem>
            <MenuItem value="weeks">{this.props.intl.formatMessage({ id: 'banUser_indicator_weeks' })}</MenuItem>
            <MenuItem value="years">{this.props.intl.formatMessage({ id: 'banUser_indicator_years' })}</MenuItem>
          </Select>
        </FormControl>
  </div>;

  /**
   * Render the user row in the user list
   *
   * @param  {object} user The user that has to be rendered
   * @return {TableRow} The tablerow associated with the user
   */
  renderUserRow = (user) =>
    <TableRow key={user.id}>
      <TableCell>
        {user.id}
      </TableCell>
      <TableCell>
        {user.username}
      </TableCell>
      <TableCell>
        {user.email}
      </TableCell>
      <TableCell>
        {user.status}
      </TableCell>
      <TableCell>
        {user.reports}
      </TableCell>
      <TableCell>
        {user.createdAt}
      </TableCell>
      <TableCell numeric>
        <FormControlLabel
          control={
            <Switch
              checked={user.active}
              onChange={(event, checked) => this.props.activateUser(user, checked) }
            />
          }
          label={this.props.intl.formatMessage({ id: 'userDetails_activate' })}
        />
        <Button
          color="primary"
          onClick={() => {
            this.props.refreshUser(user);
            this.setState({ dialogOpen: true });
          }}
        >
          <ListIcon style={{ paddingRight: 10 }} />
          {this.props.intl.formatMessage({ id: 'showUserDetails' })}
        </Button>
        <Button
            color="primary"
            onClick={() => {
                this.openDeleteModal(user)
            }}>
            <DeleteIcon style={{ paddingRight: 10 }} />
            {this.props.intl.formatMessage({ id: 'deleteUser_delete' })}
        </Button>
        <Button color="primary" onClick={() => {
            this.openBanModal(user)
          }}>
          <WarningIcon style={{ paddingRight: 10 }} />
          {this.props.intl.formatMessage({ id: 'banUser_ban' })}
        </Button>
      </TableCell>
    </TableRow>;

  /**
   * Render the dialogs
   * @return {Node} The dialogs
   */
  renderDialogs = () =>
    <div>
      <DialogWithButtons
        title={this.props.intl.formatMessage({ id: 'userDetails' })}
        description={this.renderUserDetailsDesc()}
        submitAction={this.props.intl.formatMessage({ id: 'close' })}
        isOpen={this.state.dialogOpen}
        loading={this.props.userDetails.loading}
        submit={() => this.setState({ dialogOpen: false })}
        close={() => this.setState({ dialogOpen: false })}
      />
      <DialogWithButtons
          title={this.props.intl.formatMessage({ id: 'deleteUser_title' })}
          description={this.renderUserDeleteDesc()}
          submitAction={this.props.intl.formatMessage({ id: 'deleteUser_ok' })}
          cancelAction={this.props.intl.formatMessage({ id: 'deleteUser_cancel' })}
          isOpen={this.state.deleteUserDialogOpen}
          submit={() => {
              this.props.deleteUser(this.state.toBeDeletedUser);
              this.setState({ deleteUserDialogOpen: false})

          }}
          close={() => this.setState({ deleteUserDialogOpen: false})}
          />
        <DialogWithButtons
          textField={{label: this.props.intl.formatMessage({ id: 'banUser_reason' }), fullWidth: true}}
          title={this.props.intl.formatMessage({ id: 'banUser_title' })}
          description={this.renderUserBanDesc()}
          submitAction={this.props.intl.formatMessage({ id: 'banUser_ok' })}
          cancelAction={this.props.intl.formatMessage({ id: 'banUser_cancel' })}
          isOpen={this.state.banUserDialogOpen}
          submit={(data) => {
             this.setState({ banInfo: {...this.state.banInfo, reason: data.value} }, () => {
               this.props.banUser(this.state.toBeBannedUser, this.state.banInfo);
               this.setState({banInfo: {reason: '',  expire: {amount: '', indicator: ''}}, banUserDialogOpen: false});
             })
          }}
          close={() => {
            this.setState({banInfo: {reason: '',  expire: {amount: '', indicator: ''}}, banUserDialogOpen: false});
          }}
          />
      </div>;

  /**
   * Render the user list
   *
   * @return {Node}
   */
  render() {
    return (
      <div>
        {this.renderDialogs()}

        {this.renderProgressBar()}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                {this.props.intl.formatMessage({ id: 'userId' })}
              </TableCell>
              <TableCell>
                {this.props.intl.formatMessage({ id: 'username' })}
              </TableCell>
              <TableCell>
                {this.props.intl.formatMessage({ id: 'email' })}
              </TableCell>
              <TableCell>
                {this.props.intl.formatMessage({ id: 'status' })}
              </TableCell>
              <TableCell>
                {this.props.intl.formatMessage({ id: 'reports' })}
              </TableCell>
              <TableCell>
                {this.props.intl.formatMessage({ id: 'createdAt' })}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {// Loop over each user and render a <TableRow>
            this.props.users.data.map(user =>
              this.renderUserRow(user)
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Users));
