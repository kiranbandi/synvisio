import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { findGeneMatch, filterData } from '../../redux/actions/actions';

class GeneSearch extends Component {

    constructor(props) {
        super(props);
        this.searchForGene = this.searchForGene.bind(this);
        this.onClick = this.onClick.bind(this);
        this.cancelSearch = this.cancelSearch.bind(this);
    }

    cancelSearch(event) {
        // using jquery for quick patch due to lack of time 
        // will fix it later
        $("#gene-input-search").val('');
        this.props.findGeneMatch('cancel', true);
    }

    searchForGene(event) {
        let geneId = document.getElementById('gene-input-search').value;
        this.props.findGeneMatch(geneId);
    }

    onClick(event) {
        const searchId = +event.currentTarget.id.split("search-result-")[1];
        const searchResultData = this.props.searchResult[searchId];
        this.props.filterData([searchResultData.source], [searchResultData.target], searchResultData);
    }

    render() {
        const { searchResult = [] } = this.props;

        const searchResultContent = searchResult.map((val, index) => {
            return <p className='clickable-search' onClick={this.onClick} id={'search-result-' + index} key={'search-result-' + index}><b>Alignment Score : </b> {val.score} <b>Type: </b>{val.type} <b>Source: </b>{val.source} <b>Target: </b>{val.target}</p>
        })

        return (
            <div>
                <div className='small-wrapper-header'>
                    <h4>
                        Gene Search Panel
                        <span className="icon icon-chevron-right"></span>
                    </h4>
                </div>
                <div className='small-wrapper-inner'>
                    <input id='gene-input-search' className="form-control" type="text" placeholder="Search..." />
                    <button type="submit" className="btn btn-primary-outline" onClick={this.searchForGene}>
                        SEARCH <span className="icon icon-magnifying-glass"></span>
                    </button>

                    <button type="submit" className="btn btn-danger-outline" onClick={this.cancelSearch}>
                        CLEAR
                    </button>

                    <div className='small-wrapper-inner-result'>
                        <span className="text-primary info-text-message">
                            Matching alignments are highlighted in <b>white</b> in the charts
                    </span>
                        {searchResultContent}
                    </div>
                </div>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return { searchResult: state.oracle.searchResult };
}

function mapDispatchToProps(dispatch) {
    return {
        findGeneMatch: bindActionCreators(findGeneMatch, dispatch),
        filterData: bindActionCreators(filterData, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GeneSearch);


