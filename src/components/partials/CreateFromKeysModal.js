import React from "react";

export default class CreateFromKeysModal extends React.Component {
    render() {
        return (
            <div>
                <div className={this.props.openCreateFromKeysModal
                    ? 'modal openCreateFromKeysModal active'
                    : 'modal openCreateFromKeysModal'}>
                    <div className="sendModalInner">
                        <span className="close" onClick={this.props.closeCreateFromKeysModal}>X</span>
                        <h3>Create New Wallet From Keys</h3>

                        <form onSubmit={this.props.createNewWalletFromKeys}>
                            <div className="form-wrap">
                                <div className="form-group">
                                    <label htmlFor="path">Wallet Path</label>
                                    <input name="path" value={this.props.walletPath} />

                                    <label htmlFor="address">Safex Address</label>
                                    <input name="address" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="spendkey">Safex Address Private Spendkey</label>
                                    <input name="spendkey" />

                                    <label htmlFor="viewkey">Safex Address Private Viewkey</label>
                                    <input name="viewkey" />

                                    <label htmlFor="pass1">Password</label>
                                    <input name="pass1" />

                                    <label htmlFor="pass1">Repeat Password</label>
                                    <input name="pass2" />
                                </div>
                            </div>

                            <button type="submit" className="button-shine new-wallet-btn">
                                Create New Wallet From Keys
                            </button>
                        </form>
                    </div>
                </div>

                <div className={this.props.openCreateFromKeysModal
                    ? 'backdrop active'
                    : 'backdrop'} onClick={this.props.closeCreateFromKeysModal}>
                </div>
            </div>
        );
    }
}