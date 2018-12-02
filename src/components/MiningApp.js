import React from 'react';
import packageJson from "../../package";
const { shell } = window.require('electron')
const xmrigCpu = window.require('node-xmrig-cpu');
const sa = window.require('safex-addressjs');
import { CopyToClipboard } from 'react-copy-to-clipboard';
const fileDownload = window.require('js-file-download');
const safex = window.require('safex-nodejs-libwallet');

const { dialog } = window.require('electron').remote;

const path = window.require('path');


import {
    verify_safex_address,
    structureSafexKeys,
    openBalanceAlert,
    closeBalanceAlert,
    openSendCashPopup,
    openSendTokenPopup,
    closeSendPopup
} from '../utils/balance';
import BalanceAlert from './partials/BalanceAlert';
import SendModal from './partials/SendModal';

export default class MiningApp extends React.Component {
    constructor(props) {
        super(props);
        this.miner = null;
        this.state = {
            active: false,
            starting: false,
            stopping: false,
            new_wallet: '',
            new_wallet_generated: false,
            exported: false,
            hashrate: '0',
            address: '',
            pool_url: '',
            modal_active: false,
            instructions_modal_active: false,
            balance_modal_active: false,
            instructions_lang: 'english',
            balance: 0,
            unlocked_balance: 0,
            tokens: 0,
            unlocked_tokens: 0,
            balance_wallet: '',
            balance_view_key: '',
            balance_spend_key: '',
            balance_check: false,
            balance_alert: '',
            balance_alert_text: '',
            send_cash: false,
            send_token: false,

            //wallet state settings


            wallet_exists: false,
            mining_address: '',
            wallet_password: '',
            wallet_path: '',
            spendkey_sec: '',
            viewkey_sec: '',

            jsonConfig: {
                "algo": "cryptonight/2",
                "api": {
                    "port": 0,
                    "access-token": null,
                    "worker-id": null,
                    "ipv6": false,
                    "restricted": true
                },
                "av": 0,
                "background": false,
                "colors": true,
                "cpu-affinity": null,
                "cpu-priority": null,
                "donate-level": 5,
                "huge-pages": true,
                "hw-aes": null,
                "log-file": null,
                "max-cpu-usage": 100,
                "pools": [
                    {
                        "url": "",
                        "user": "",
                        "pass": "x",
                        "rig-id": null,
                        "nicehash": false,
                        "keepalive": false,
                        "variant": 1
                    }
                ],
                "print-time": 60,
                "retries": 5,
                "retry-pause": 5,
                "safe": false,
                "threads": null,
                "user-agent": null,
                "watch": false
            }
        };

        this.openInfoPopup = this.openInfoPopup.bind(this);
        this.openModal = this.openModal.bind(this);
        this.openInstructionsModal = this.openInstructionsModal.bind(this);
        this.openBalanceModal = this.openBalanceModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.inputValidate = this.inputValidate.bind(this);
        this.checkInputValueLenght = this.checkInputValueLenght.bind(this);
        this.checkInputValuePrefix = this.checkInputValuePrefix.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.startMining = this.startMining.bind(this);
        this.startBalanceCheck = this.startBalanceCheck.bind(this);
        this.stopMining = this.stopMining.bind(this);
        this.checkStatus = this.checkStatus.bind(this);
        this.newWallet = this.newWallet.bind(this);
        this.footerLink = this.footerLink.bind(this);
        this.exportWallet = this.exportWallet.bind(this);
        this.backToBalanceModal = this.backToBalanceModal.bind(this);
        this.setOpenBalanceAlert = this.setOpenBalanceAlert.bind(this);
        this.setCloseBalanceAlert = this.setCloseBalanceAlert.bind(this);
        this.setOpenSendCash = this.setOpenSendCash.bind(this);
        this.setOpenSendTokens = this.setOpenSendTokens.bind(this);
        this.setCloseSendPopup = this.setCloseSendPopup.bind(this);
        this.sendCash = this.sendCash.bind(this);
        this.sendToken = this.sendToken.bind(this);

        //wallet functions
        this.create_new_wallet = this.create_new_wallet.bind(this);
        this.open_from_wallet_file = this.open_from_wallet_file.bind(this);
        this.create_new_wallet = this.create_new_wallet.bind(this);
        this.create_new_wallet_from_keys = this.create_new_wallet_from_keys.bind(this);
    }


    //first step select wallet path, if exists, set password
    //second step set password


    //paste in address start mining
    //create new
    //import -> keys/file


    create_new_wallet(e) {



        e.preventDefault();

        const pass1 = e.target.pass1.value;
        const pass2 = e.target.pass2.value;

        console.log(e.target.pass1.value);
        dialog.showSaveDialog((filepath) => {
            if (filepath !== undefined) {

                this.setState({wallet_path: filepath});


                //TODO needs additional sanitation on the passwords, length and type of data
                if (pass1 === pass2) {

                    var args = {
                        'path': filepath,
                        'password': pass1,
                        'network': 'mainnet',
                        'daemonAddress': 'rpc.safex.io:17402',
                    }

                    var promise = null;

                    if (!safex.walletExists(filepath)) {
                        this.setState(() => ({
                            wallet_exists: false
                        }));
                        console.log("wallet doesn't exist. creating new one: " + this.state.wallet_path);

                        promise = safex.createWallet(args);

                    } else {
                        this.setState(() => ({
                            wallet_exists: true
                        }));
                        console.log("wallet already exists. Please choose a different file name  " +
                            "this application does not enable overwriting an existing wallet file" +
                            "OR you can open it using the Load Existing Wallet");
                    }


                } else {

                    console.log("password 1 and 2 do not match");


                }



            }
        });
        //pass dialog box
        //pass password
        //confirm password



    }

    create_new_wallet_from_keys(e) {

        var safex_address = '';
        var view_key = '';
        var spend_key = '';

        if (verify_safex_address(spend_key, view_key, safex_address)) {
            dialog.showSaveDialog((filepath) => {
                if (filepath !== undefined) {

                    this.setState({wallet_path: filepath});



                }
            });

        } else {
            console.log('Incorrect keys');
            this.setOpenBalanceAlert('Incorrect keys');
        }


    }

    open_from_wallet_file() {
        dialog.showOpenDialog((filepath) => {
            if (filepath !== undefined) {

                this.setState({wallet_path: filepath});



            }
        });
    }







    openInfoPopup(message) {
        this.setState({
            mining_info: true,
            mining_info_text: message
        })
    }

    openModal() {
        this.setState({
            modal_active: true
        })
    }

    openInstructionsModal() {
        this.setState({
            instructions_modal_active: true
        })
    }

    startBalanceCheck(e) {
        e.preventDefault();

        var balance_wallet = e.target.wallet_balance_address.value;
        var balance_view_key = e.target.wallet_balance_private_view_key.value;
        var balance_spend_key = e.target.wallet_balance_private_spend_key.value;

        if (balance_wallet === '' || balance_view_key === '' || balance_spend_key === '') {
            this.setOpenBalanceAlert('Fill out all the fields');
        } else {
            if (verify_safex_address(balance_spend_key, balance_view_key, balance_wallet)) {
                const safex_keys = structureSafexKeys(balance_spend_key, balance_view_key);

                this.setState(() => ({
                    balance_check: true,
                    balance_wallet: balance_wallet,
                    balance_view_key: balance_view_key,
                    balance_spend_key: balance_spend_key,
                }));

                var args = {
                    'path': this.state.wallet_path,
                    'password': '123',
                    'network': 'mainnet',
                    'daemonAddress': 'rpc.safex.io:17402',
                    'restoreHeight': 0,
                    'addressString': this.state.balance_wallet,
                    'viewKeyString': this.state.balance_view_key,
                    'spendKeyString': this.state.balance_spend_key
                }

                var promise = null;

                if (!safex.walletExists(this.state.wallet_path)) {
                    this.setState(() => ({
                        wallet_exists: false
                    }));
                    console.log("wallet doesn't exist. creating new one: " + this.state.wallet_path);
                    if (args.mnemonic)
                        promise = safex.recoveryWallet(args);
                    else if (args.addressString)
                        promise = safex.createWalletFromKeys(args);
                    else
                        promise = safex.createWallet(args);
                } else {
                    this.setState(() => ({
                        wallet_exists: true
                    }));
                    console.log("wallet already exists. opening: " + this.state.wallet_path);
                    promise = safex.openWallet(args);
                }

                var wallet = null;

                const nextTick = () => {
                    if (wallet) {
                        this.setState(() => ({
                            balance: parseInt(wallet.balance() / 10000000000).toFixed(2),
                            unlocked_balance: parseInt(wallet.unlockedBalance() / 10000000000).toFixed(2),
                            tokens: parseInt(wallet.tokenBalance() / 10000000000).toFixed(2),
                            unlocked_tokens: parseInt(wallet.unlockedTokenBalance() / 10000000000).toFixed(2),
                        }));
                        console.log("balance: " + wallet.balance());
                        console.log("unlocked balance: " + wallet.unlockedBalance());
                        console.log("token balance: " + wallet.tokenBalance());
                        console.log("unlocked token balance: " + wallet.unlockedTokenBalance());
                    }

                    setTimeout(nextTick, 10000);
                }

                var lastHeight = 0;
                promise.then((w) => {
                    console.log("balance address: " + w.address());
                    console.log("seed: " + w.seed());

                    wallet = w;
                    wallet.on('newBlock', (height) => {
                        if (height - lastHeight > 60) {
                            console.log("blockchain updated, height: " + height);
                            lastHeight = height;
                        }
                    });

                    wallet.on('refreshed', () => {
                        console.log("wallet refreshed");

                        wallet.store()
                            .then(() => { console.log("wallet stored") })
                            .catch((e) => { console.log("unable to store wallet: " + e) })
                    });

                    wallet.on('updated', function () {
                        console.log("updated");
                    });

                    wallet.on('unconfirmedMoneyReceived', function (tx, amount) {
                        console.log("unconfirmed money received. tx: " + tx + ", amount: " + amount);
                    });

                    wallet.on('moneyReceived', function (tx, amount) {
                        console.log("money received. tx: " + tx + ", amount: " + amount);
                    });

                    wallet.on('moneySpent', function (tx, amount) {
                        console.log("money spent. tx: " + tx + ", amount: " + amount);
                    });

                    wallet.on('unconfirmedTokensReceived', function (tx, token_amount) {
                        console.log("unconfirmed tokens received. tx: " + tx + ", token amount: " + token_amount);
                    });

                    wallet.on('tokensReceived', function (tx, token_amount) {
                        console.log("tokens received. tx: " + tx + ", token amount: " + token_amount);
                    });

                    wallet.on('tokensSpent', function (tx, token_amount) {
                        console.log("tokens spent. tx: " + tx + ", token amount: " + token_amount);
                    });

                    nextTick();
                })
                    .catch((e) => {
                        console.log("no luck tonight: " + e);
                    });
            } else {
                console.log('Incorrect or duplicate keys');
                this.setOpenBalanceAlert('Incorrect or duplicate keys');
            }
        }
    }

    openBalanceModal() {
        this.setState(() => ({
            balance_modal_active: true
        }));
    }

    setOpenBalanceAlert(alert) {
        openBalanceAlert(this, alert);
    }

    setCloseBalanceAlert() {
        closeBalanceAlert(this);
    }

    backToBalanceModal() {
        this.setState(() => ({
            wallet_exists: false
        }));
    }

    setOpenSendCash() {
        openSendCashPopup(this);
    }

    setOpenSendTokens() {
        openSendTokenPopup(this);
    }

    setCloseSendPopup() {
        closeSendPopup(this);
    }

    sendCash(e) {
        e.preventDefault();
        let sendingAddress = e.target.send_to.value;
        let amount = parseInt(e.target.amount.value) * 10000000000;
        let promise = null;
        let wallet = null;
        let args = {
            'path': this.state.wallet_path,
            'password': '123',
            'network': 'mainnet',
            'daemonAddress': 'rpc.safex.io:17402',
            'restoreHeight': 0,
            'addressString': this.state.balance_wallet,
            'viewKeyString': this.state.balance_view_key,
            'spendKeyString': this.state.balance_spend_key
        }

        promise = safex.openWallet(args);

        if (sendingAddress === '' || amount === '') {
            this.setOpenBalanceAlert('Fill out all the fields');
        } else {
            promise.then((w) => {
                wallet = w;

                wallet.createTransaction({
                    'address': sendingAddress,
                    'amount': amount,
                    'tx_type': 0 // cash transaction
                }).then((tx) => {
                    console.log("Cash transaction created: " + tx.transactionsIds());

                    tx.commit().then(() => {
                        console.log("Transaction commited successfully");
                        this.setCloseSendPopup();
                        this.setOpenBalanceAlert('Transaction commited successfully');

                    }).catch((e) => {
                        console.log("Error on commiting transaction: " + e);
                        this.setOpenBalanceAlert("Error on commiting transaction: " + e);
                    });
                }).catch((e) => {
                    console.log("Couldn't create transaction: " + e);
                    this.setOpenBalanceAlert("Couldn't create transaction: " + e);
                });
            })
                .catch((e) => {
                    console.log("Error parsing wallet file: " + e);
                    this.setOpenBalanceAlert("Error parsing wallet file: " + e);
                });
        }
    }

    sendToken(e) {
        e.preventDefault();
        let sendingAddress = e.target.send_to.value;
        let amount = parseInt(e.target.amount.value) * 10000000000;
        let promise = null;
        let wallet = null;
        let args = {
            'path': this.state.wallet_path,
            'password': '123',
            'network': 'testnet',
            'daemonAddress': '192.168.1.194:29393',
            'restoreHeight': 0,
            'addressString': this.state.balance_wallet,
            'viewKeyString': this.state.balance_view_key,
            'spendKeyString': this.state.balance_spend_key
        }

        promise = safex.openWallet(args);

        if (sendingAddress === '' || amount === '') {
            this.setOpenBalanceAlert('Fill out all the fields');
        } else {
            promise.then((w) => {
                wallet = w;

                wallet.createTransaction({
                    'address': sendingAddress,
                    'amount': amount,
                    'tx_type': 1 // token transaction
                }).then((tx) => {
                    console.log("Cash transaction created: " + tx.transactionsIds());

                    tx.commit().then(() => {
                        console.log("Transaction commited successfully");
                        this.setCloseSendPopup();
                        this.setOpenBalanceAlert('Transaction commited successfully');

                    }).catch((e) => {
                        console.log("Error on commiting transaction: " + e);
                        this.setOpenBalanceAlert("Error on commiting transaction: " + e);
                    });
                }).catch((e) => {
                    console.log("Couldn't create transaction: " + e);
                    this.setOpenBalanceAlert("Couldn't create transaction: " + e);
                });
            })
                .catch((e) => {
                    console.log("Error parsing wallet file: " + e);
                    this.setOpenBalanceAlert("Error parsing wallet file: " + e);
                });
        }
    }

    closeModal() {
        this.setState(() => ({
            modal_active: false,
            instructions_modal_active: false,
            balance_modal_active: false,
            balance_alert: false,
            balance_alert: false,
            send_cash: false,
            send_token: false
        }));
    }

    changeInstructionLang(lang) {
        this.setState(() => ({
            instructions_lang: lang
        }));
    }

    inputValidate(inputValue) {
        let inputRegex = /^[a-zA-Z0-9]/;
        return inputRegex.test(inputValue);
    }

    checkInputValueLenght(inputValue) {
        let inputValueLength = inputValue.length;

        if (inputValueLength <= 95) {
            console.log('Safex hash address length is too short');
            this.openInfoPopup('Address length is too short');
            return false;
        } else if (inputValueLength >= 105) {
            console.log('Safex hash address length is too long');
            this.openInfoPopup('Address length is too long');
            return false;
        } else {
            return true;
        }
    }

    checkInputValuePrefix(inputValue) {
        let userInputValue = inputValue;

        if (userInputValue.startsWith("SFXt") || userInputValue.startsWith("Safex")) {
            if (!userInputValue.startsWith("SFXts") || !userInputValue.startsWith("SFXti")) {
                return true;
            } else {
                console.log('Suffix is invalid');
                return false;
            }
        } else {
            console.log('Suffix is invalid');
            return false;
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        var user_wallet = e.target.user_wallet;
        var pool = e.target.pool;
        let inputValue = e.target.user_wallet.value;

        if (user_wallet.value !== '') {
            if (this.inputValidate(inputValue))
                if (this.checkInputValueLenght(inputValue)) {
                    if (this.checkInputValuePrefix(inputValue)) {
                        if (this.state.active) {
                            this.setState(() => ({
                                active: false,
                                stopping: true
                            }));
                            this.openInfoPopup('Stopping miner...');
                            setTimeout(() => {
                                this.setState(() => ({
                                    mining_info: false,
                                    mining_info_text: '',
                                    stopping: false
                                }));
                            }, 5000);
                            this.stopMining();
                        } else {
                            this.setState(() => ({
                                active: true,
                                starting: true
                            }));
                            this.openInfoPopup('Starting miner...');
                            setTimeout(() => {
                                this.setState(() => ({
                                    starting: false
                                }));
                                this.openInfoPopup('Mining in progress');
                            }, 12000);
                            this.startMining();
                        }
                    } else {
                        this.openInfoPopup('Your address must start with Safex or SFXt');
                    }
                } else {
                    console.log('Address length is not valid')
                }
            else {
                this.openInfoPopup('Please enter valid address');
            }
        } else {
            this.openInfoPopup('Please enter valid address');
        }
    }

    startMining() {
        var userWallet = document.getElementById("user_wallet").value;
        var pool = document.getElementById("pool").value;
        var maxCpuUsage = document.getElementById("cpuUsage").value;

        //specify jsonConfig.pools[0].url, jsonConfig.pools[0].user (safex address)
        this.state.jsonConfig.pools[0].url = pool;
        this.state.jsonConfig.pools[0].user = userWallet;
        this.state.jsonConfig["max-cpu-usage"] = maxCpuUsage;

        console.log("User address: " + userWallet);
        console.log("Pool: " + pool);
        console.log("CPU usage: " + maxCpuUsage);

        console.log("Starting mining...");
        if (this.miner) {
            this.miner.reloadConfig(JSON.stringify(this.state.jsonConfig));
        } else {
            this.miner = new xmrigCpu.NodeXmrigCpu(JSON.stringify(this.state.jsonConfig));
        }
        this.miner.startMining();
        console.log("Native mining started!");

        let checkStatusInterval = setInterval(this.checkStatus, 2000);
        this.setState({
            checkStatusInterval: checkStatusInterval,
        })
    }

    stopMining() {
        console.log("Ending mining...");
        clearInterval(this.state.checkStatusInterval);
        this.setState(() => ({
            hashrate: 0
        }));
        this.miner.stopMining();
        console.log("Mining ended");
    }

    checkStatus() {
        this.setState({
            hashrate: this.miner.getStatus().split(' ')[2]
        });
        console.log(this.miner.getStatus(), this.state.hashrate);
    }

    newWallet() {
        const seed = sa.sc_reduce32(sa.rand_32());
        const keys = sa.create_address(seed);
        const pubkey = sa.pubkeys_to_string(keys.spend.pub, keys.view.pub);

        localStorage.setItem('wallet', JSON.stringify(keys));

        this.setState(() => ({
            exported: false,
            new_wallet_generated: true,
            new_wallet: pubkey,
            spendkey_sec: keys.spend.sec,
            viewkey_sec: keys.view.sec,
        }));
    }

    exportWallet() {
        var wallet_data = JSON.parse(localStorage.getItem('wallet'));
        var keys = "";

        keys += "Public address: " + wallet_data.public_addr + '\n';
        keys += "Spendkey " + '\n';
        keys += "pub: " + wallet_data.spend.pub + '\n';
        keys += "sec: " + wallet_data.spend.sec + '\n';
        keys += "Viewkey " + '\n';
        keys += "pub: " + wallet_data.view.pub + '\n';
        keys += "sec: " + wallet_data.view.sec + '\n';
        var date = Date.now();

        fileDownload(keys, date + 'unsafex.txt');

        this.setState(() => ({
            exported: true
        }));
    }

    footerLink() {
        shell.openExternal('https://www.safex.io/')
    }







    render() {
        var cores_options = [];
        for (var i = 25; i <= 100; i += 25) {
            cores_options.push(<option key={i} value={i}>{i}%</option>);
        }

        return (
            <div className="mining-app-wrap">
                <div className="mining-bg-wrap">
                    <img className={this.state.active || this.state.stopping ? "rotating" : ""} src="images/circles.png" alt="Circles" />
                </div>
                <header className="animated fadeIn">
                    <img src="images/logo.png" alt="Logo" />
                    <p className="animated fadeIn">{packageJson.version}</p>
                </header>

                <div className="main animated fadeIn">

                    <form onSubmit={this.create_new_wallet}>
                        <input name="path" value={this.state.wallet_path} />
                        <input name="pass1" />
                        <input name="pass2" />

                        <button type="submit" className="button-shine new-wallet-btn">
                            Create New Wallet
                        </button>
                    </form>


                    <button className="button-shine new-wallet-btn" onClick={this.openModal}>
                        New wallet
                    </button>
                    <button className="button-shine balance-wallet-btn" onClick={this.openBalanceModal} title="Check Balance">
                        <img src="images/key.png" alt="key" />
                    </button>
                    <button className="button-shine instructions-btn" onClick={this.openInstructionsModal} title="Instructions">
                        ?
                    </button>
                    <form onSubmit={this.handleSubmit}>
                        <div className="address-wrap">
                            <img src="images/line-left.png" alt="Line Left" />
                            <input type="text" placeholder="Safex address" name="user_wallet" id="user_wallet"
                                disabled={this.state.active ? "disabled" : ""} />
                            <img src="images/line-right.png" alt="Line Right" />
                        </div>

                        <select className="pool-url" name="pool" id="pool" disabled={this.state.active ? "disabled" : ""}>
                            <option>pool.safexnews.net:1111</option>
                            <option>safex.cool-pool.net:3333</option>
                            <option>safex.cnpools.space:3333</option>
                            <option>safex.cnpools.space:1111</option>
                            <option>safex.cryptominingpools.net:3333</option>
                            <option>safex.luckypool.io:3366</option>
                            <option>safex.xmining.pro:3333</option>
                        </select>

                        <div className="options">
                            <div className="input-group">
                                <p># CPU</p>
                                <select className="form-control" name="cores" id="cpuUsage"
                                    disabled={this.state.active ? "disabled" : ""}>
                                    {cores_options}
                                </select>
                            </div>
                        </div>
                        {
                            this.state.active
                                ?
                                <div>
                                    {
                                        this.state.starting
                                            ?
                                            <button type="submit" className="submit button-shine active" disabled>
                                                Starting
                                            </button>
                                            :
                                            <button type="submit" className="submit button-shine active">
                                                Stop
                                            </button>
                                    }
                                </div>

                                :
                                <div>
                                    {
                                        this.state.stopping
                                            ?
                                            <button type="submit" className="submit button-shine active" disabled={this.state.active || this.state.stopping ? "disabled" : ""}>
                                                <span>Stopping</span>
                                            </button>
                                            :
                                            <button type="submit" className="submit button-shine" disabled={this.state.active || this.state.stopping ? "disabled" : ""}>
                                                <span>Start</span>
                                            </button>
                                    }
                                </div>
                        }
                        <p className={this.state.mining_info ? "mining-info active" : "mining-info"}>
                            {this.state.mining_info_text}
                        </p>
                    </form>

                    <div className="hashrate">
                        <p className="blue-text">hashrate:</p>
                        <p className="white-text">{this.state.hashrate} H/s</p>
                    </div>
                </div>

                <footer className="animated fadeIn">
                    <p>powered by</p>
                    <a onClick={this.footerLink} title="Visit our site">
                        <img src="images/balkaneum.png" alt="Balkaneum" />
                    </a>
                </footer>


                <div className={this.state.modal_active ? 'modal active' : 'modal'}>
                    <span className="close" onClick={this.closeModal}>X</span>
                    <button id="new-wallet" className="button-shine" onClick={this.newWallet}>
                        Generate new wallet
                    </button>

                    <div className="form-group">
                        <label htmlFor="new-address">Your new wallet address:</label>
                        <textarea placeholder="New Wallet Address" value={this.state.new_wallet} rows="2" onChange={({ target: { value } }) => this.setState({ value, copied: false })} readOnly >

                        </textarea>
                        <div className={this.state.new_wallet_generated ? "spendview active" : "spendview"}>
                            {
                                this.state.copied
                                    ?
                                    <CopyToClipboard text={this.state.new_wallet} onCopy={() => this.setState({ copied: true })} className="button-shine copy-btn" disabled={this.state.new_wallet === '' ? "disabled" : ""}>
                                        <button>
                                            Copied Address
                                        </button>
                                    </CopyToClipboard>
                                    :
                                    <CopyToClipboard text={this.state.new_wallet} onCopy={() => this.setState({ copied: true })} className="button-shine copy-btn" disabled={this.state.new_wallet === '' ? "disabled" : ""}>
                                        <button>
                                            Copy Address
                                        </button>
                                    </CopyToClipboard>
                            }

                            {
                                this.state.exported
                                    ?
                                    <h5 className="warning green">
                                        Wallet keys have been successfuly saved.
                                        Please do not share your keys with others and keep them safe at all times.
                                        Good luck!
                                    </h5>
                                    :
                                    <h5 className="warning red">
                                        The following keys are to control your coins, do not share them.
                                        Keep your keys for yourself only!
                                        Before you proceed to mine please save your keys now.
                                    </h5>
                            }

                            <h5>Secret Spendkey</h5>
                            <p>{this.state.spendkey_sec}</p>

                            <h5>Secret Viewkey</h5>
                            <p>{this.state.viewkey_sec}</p>

                            {
                                this.state.exported
                                    ?
                                    <button className="save-btn green" onClick={this.exportWallet}>
                                        Wallet Keys Saved
                                    </button>
                                    :
                                    <button className="save-btn" onClick={this.exportWallet}>
                                        Save Wallet Keys
                                    </button>
                            }
                        </div>
                    </div>
                </div>


                <div className={this.state.instructions_modal_active ? 'modal instructions-modal active' : 'modal instructions-modal'}>
                    <span className="close" onClick={this.closeModal}>X</span>
                    <div className="lang-bts-wrap">
                        <button className={this.state.instructions_lang === 'english' ? "button-shine active" : "button-shine"} onClick={this.changeInstructionLang.bind(this, 'english')}>EN</button>
                        <button className={this.state.instructions_lang === 'serbian' ? "button-shine active" : "button-shine"} onClick={this.changeInstructionLang.bind(this, 'serbian')}>SRB</button>
                    </div>
                    {
                        this.state.instructions_lang === 'english'
                            ?
                            <div>
                                <h3>Instructions</h3>
                                <p>
                                    If you don't already have a Safex Wallet, click the <button>new wallet</button> button.
                                        In the dialog box, click <button>generate new wallet</button> which will create new Safex Wallet. Be sure to
                                        <button className="red-btn red-btn-en">save wallet keys</button> before proceeding.
                                    </p>
                                <p>
                                    <strong>
                                        Wallet keys are made to control your coins, make sure you keep them safe at all times.
                                        If your keys get stolen it can and will result in total loss of your Safex Cash.
                                        </strong>
                                </p>
                                <p className="warning green">
                                    Once your wallet keys are saved, you are ready to start mining. <button className="green-btn">wallet keys saved</button>
                                </p>
                                <p>
                                    Enter you wallet address in the Safex Address field, select one of the pools you want to connect to, choose how much CPU power you want to use for mining and click start to begin.
                                    That's it, mining will start in a couple of seconds. Good luck!
                                    </p>
                            </div>
                            :
                            <div>
                                <h3>Uputstvo</h3>
                                <p>
                                    Ako nemate Safex Wallet, kliknite <button>new wallet</button> dugme.
                                        U dialog prozoru kliknite <button className="gen-new-wallet-sr">generate new wallet</button> dugme koje će kreirati novi Safex Wallet.
                                        Obavezno sačuvajte Vaše ključeve <button className="red-btn">save wallet keys</button> pre nego što nastavite.
                                    </p>
                                <p>
                                    <strong>
                                        Ovi ključevi kontrolišu Vaše novčiće, zato ih uvek čuvajte na bezbednom.
                                        Ako Vaši ključevi budu ukradeni sigurno ćete izgubiti sav Vaš Safex Cash.
                                        </strong>
                                </p>
                                <p className="warning green">
                                    Sačuvajte Vaše ključeve, i spremni ste da počnete sa rudarenjem. <button className="green-btn">wallet keys saved</button>
                                </p>
                                <p>
                                    Ukucajte adresu Vašeg wallet-a u predviđeno polje, izaberite pool na koji želite da se povežete, izaberite koliku procesorku snagu želite da koristite i počnite sa rudarenjem.
                                    To je to, rudarenje će početi za par sekundi. Srećno!
                                    </p>
                            </div>
                    }
                </div>

                <div className={this.state.balance_modal_active ? 'modal balance-modal active' : 'modal balance-modal'}>
                    <span className="close" onClick={this.closeModal}>X</span>
                    <h3>Check Balance</h3>

                    {
                        this.state.wallet_exists
                            ?
                            <div className="wallet-exists">
                                <button className="back" onClick={this.backToBalanceModal}>Go back</button>
                                <label htmlFor="selected_balance_address">Safex Wallet Address</label>
                                <textarea placeholder="Safex Wallet Address" name="selected_balance_address" value={this.state.balance_wallet} rows="2" readOnly />

                                <div className="groups-wrap">
                                    <div className="form-group">
                                        <label htmlFor="balance">Balance</label>
                                        <input type="text" placeholder="Balance" name="balance" value={this.state.balance} readOnly />
                                        <label htmlFor="unlocked_balance">Unlocked Balance</label>
                                        <input type="text" placeholder="Unlocked balance" name="unlocked_balance" value={this.state.unlocked_balance} readOnly />
                                        <button onClick={this.setOpenSendCash}>Send Cash</button>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="tokens">Tokens</label>
                                        <input type="text" placeholder="Tokens" value={this.state.tokens} readOnly />
                                        <label htmlFor="unlocked_tokens">Unlocked Tokens</label>
                                        <input type="text" placeholder="Unlocked Tokens" name="unlocked_tokens" value={this.state.unlocked_tokens} readOnly />
                                        <button onClick={this.setOpenSendTokens}>Send Tokens</button>
                                    </div>
                                </div>
                            </div>
                            :
                            <div className="no-wallet">
                                <form onSubmit={this.startBalanceCheck}>
                                    <label htmlFor="wallet_balance_address">Safex Wallet Address</label>
                                    <textarea placeholder="Enter Safex Wallet Address" name="wallet_balance_address" defaultValue={this.state.balance_wallet} rows="2" />
                                    <label htmlFor="wallet_balance_private_view_key">Safex Address Private View Key</label>
                                    <input type="text" placeholder="Enter Safex Address Private View Key" name="wallet_balance_private_view_key" defaultValue={this.state.balance_view_key} />
                                    <label htmlFor="wallet_balance_private_spend_key">Safex Address Private Spend Key</label>
                                    <input type="text" placeholder="Enter Safex Address Private Spend Key" name="wallet_balance_private_spend_key" defaultValue={this.state.balance_spend_key} />
                                    <button type="submit">
                                        Check balance
                                    </button>
                                </form>
                            </div>
                    }

                    <BalanceAlert
                        balanceAlert={this.state.balance_alert}
                        balanceAlertText={this.state.balance_alert_text}
                        closeBalanceAlert={this.setCloseBalanceAlert}

                    />

                    <SendModal
                        send_cash={this.state.send_cash}
                        send_token={this.state.send_token}
                        fromAddress={this.state.balance_wallet}
                        closeSendPopup={this.setCloseSendPopup}
                        sendCash={this.sendCash}
                        sendToken={this.sendToken}
                    />

                </div>

                <div className={this.state.modal_active || this.state.instructions_modal_active || this.state.balance_modal_active ? 'backdrop active' : 'backdrop'} onClick={this.closeModal}>
                </div>
            </div>
        );
    }
}

MiningApp.contextTypes = {
    router: React.PropTypes.object.isRequired
};
