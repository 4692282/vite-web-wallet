<template>
    <div class="SBP-wrapper">
        <sec-title></sec-title>

        <loading v-if="loadingToken" class="loading"></loading>

        <div v-if="!loadingToken" class="section">
            <div class="__second-title">{{ $t('walletSBP.section1.title') }}</div>
            <register :canUseAddr="canUseAddr"></register>
        </div>

        <div v-if="!loadingToken" class="section">
            <div class="__second-title">{{ $t('walletSBP.section2.title') }}</div>
            <list :showConfirm="showConfirm"></list>
        </div>

        <confirm v-if="showConfirmType" :showMask="true" class="small"
                 :title="$t(`walletSBP.confirm.${showConfirmType}.title`)" :singleBtn="true"
                 :closeIcon="true" :close="closeConfirm"
                 :leftBtnTxt="$t(`walletSBP.confirm.${showConfirmType}.btn`)" :leftBtnClick="validTx"
                 :btnUnuse="!!btnUnuse">
            <div v-if="showConfirmType === 'edit'">
                <div class="input-err" v-show="addrErr">{{ addrErr }}</div>
                <vite-input v-model="addr" :valid="testAddr"
                            :placeholder="$t(`walletSBP.confirm.${showConfirmType}.placeholder`)"></vite-input>
            </div>
        </confirm>
    </div>
</template>

<script>
import { wallet } from '@vite/vitejs';
import secTitle from 'pcComponents/secTitle';
import loading from 'components/loading';
import confirm from 'pcComponents/confirm/confirm.vue';
import viteInput from 'components/viteInput';
import { initPwd } from 'pcComponents/password/index.js';
import { execWithValid } from 'pcUtils/execWithValid';
import sendTx from 'pcUtils/sendTx';
import register from './register';
import list from './list';

export default {
    components: { secTitle, register, list, loading, confirm, viteInput },
    destroyed() {
        this.clearAll();
    },
    data() {
        return {
            loadingToken: false,
            showConfirmType: '',
            activeItem: {},

            loading: false,
            addr: '',
            addrErr: '',
            tips: false
        };
    },
    computed: {
        btnUnuse() {
            return !this.addr || this.loading || this.addrErr;
        },
        regAddrList() {
            return this.$store.getters.regAddrList;
        },
        netStatus() {
            return this.$store.state.env.clientStatus;
        }
    },
    watch: {
        address() {
            this.$store.dispatch('stopLoopRegList');
        }
    },
    methods: {
        canUseAddr(nodeName, addr) {
            const usedAddrList = [];
            for (const name in this.regAddrList) {
                const canUseCancelAddr = (name === nodeName);
                this.regAddrList[name].forEach(item => {
                    if (item.isCancel && canUseCancelAddr) {
                        return;
                    }
                    usedAddrList.push(item.nodeAddr);
                });
            }

            return usedAddrList.indexOf(addr) === -1;
        },
        testAddr() {
            if (this.stopWatch) {
                return;
            }

            if (!this.addr
                || !wallet.isValidAddress(this.addr)) {
                this.addrErr = this.$t('walletSBP.section1.addrErr');

                return;
            }

            if (!this.canUseAddr(this.activeItem.name, this.addr)) {
                this.addrErr = this.$t('walletSBP.section1.addrUsed');

                return;
            }

            this.addrErr = '';
        },
        showTips() {
            this.tips = true;
        },
        hideTips() {
            this.tips = false;
        },

        showConfirm(type, activeItem) {
            this.showConfirmType = type;
            this.stopWatch = false;

            if (!activeItem) {
                return;
            }
            this.activeItem = activeItem;
        },
        closeConfirm() {
            this.showConfirmType = '';
            this.activeItem = null;
            this.clearAll();
        },
        clearAll() {
            this.stopWatch = true;
            this.addr = '';
            this.addrErr = '';
        },

        validTx: execWithValid(function () {
            this.testAddr();
            if (this.btnUnuse) {
                return;
            }

            const showConfirmType = this.showConfirmType;
            this.showConfirmType = '';

            initPwd({
                cancel: () => {
                    this.closeConfirm();
                },
                submit: () => {
                    this.showConfirm(showConfirmType);
                    (showConfirmType === 'edit') && this.sendUpdateTx();
                }
            });
        }),
        sendUpdateTx() {
            this.loading = true;

            const nodeName = this.activeItem.name;
            const producer = this.addr;

            if (!this.netStatus) {
                this.$toast(this.$t('hint.noNet'));
                return;
            }

            sendTx({
                methodName: 'updateSBPBlockProducingAddress',
                data: {
                    blockProducingAddress: producer,
                    sbpName: this.activeItem.name
                },
                config: {
                    pow: false,
                    confirm: {
                        showMask: true,
                        operate: this.$t('btn.edit')
                    }
                }
            }).then(() => {
                this.loading = false;
                this.$toast(this.$t('hint.request', { name: this.$t('walletSBP.section2.update') }));
                this.closeConfirm();
                this.$store.dispatch('loopRegList', {
                    nodeName,
                    operate: 2,
                    producer
                });
            }).catch(err => {
                console.warn(err);
                this.loading = false;
                this.$toast(this.$t('walletSBP.section2.updateFail'), err);
            });
        }
    }
};
</script>

<style lang="scss" scoped>
@import "~pcAssets/scss/common.scss";

@include secondTitle();

.SBP-wrapper {
    position: relative;
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;

    .loading {
        width: 60px;
        height: 60px;
        margin-top: -30px;
        margin-left: -30px;
    }
}

.gray-wrapper {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.6);
    z-index: 100;

    .input-err {
        position: absolute;
        right: 30px;
        top: 2px;
        font-size: 12px;
        color: #ff2929;
        line-height: 26px;
    }
}

.section {
    &:last-child {
        padding-top: 14px;
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 300px;
        box-sizing: border-box;
    }

    .__second-title {
        margin-bottom: 14px;
    }
}

.row {
    position: relative;
    margin-top: 20px;

    &:first-child {
        margin-top: 0;
    }

    .row-t {
        position: relative;
        @include font-family-bold();
        font-size: 14px;
        color: #1d2024;
        letter-spacing: 0.35px;
        line-height: 16px;
        padding-bottom: 15px;
    }

    .row-content {
        padding: 10px 15px;
        border: 1px solid #d4dee7;
        border-radius: 2px;
        font-size: 14px;
        box-sizing: border-box;

        &.unuse {
            @include gray_btn_color();
            @include font-family-normal();
            font-size: 14px;
        }

        input {
            width: 100%;
        }
    }

    .err {
        position: absolute;
        left: 90px;
        right: 0;
        font-size: 12px;
        color: #ff2929;
        line-height: 16px;
        text-align: right;
    }
}
</style>
