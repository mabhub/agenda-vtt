import React from 'react';
import get from 'lodash/get';
import Helmet from 'react-helmet';
import moment from 'moment';

import Intro from '../components/Intro';
import CalenDay from '../components/CalenDay';
import * as Styled from '../components/Styles';
import LabelGroup from '../components/LabelGroup';

import { Cycliste, Marcheur, Coureur } from '../components/emojis';

moment.locale('fr');

const MonthTitle = props => <Styled.Month>{props.month}</Styled.Month>;

const Event = props => {
  const date = moment(props.frontmatter.date);
  const time = date.format('HH[h]mm');

  return (
    <Styled.Event>
      <CalenDay
        date={moment(props.frontmatter.date)}
        firstOfDay={props.newDay}
      />
      <div>
        <Styled.Place>
          <strong>{props.frontmatter.commune}</strong> ({props.frontmatter.departement})
        </Styled.Place>

        <Styled.Title>{props.frontmatter.title}</Styled.Title>

        <LabelGroup items={[time]} tooltip="Départ à…" />
        <LabelGroup items={props.frontmatter.distances} icon={<Cycliste />} color="#aaf" tooltip="VTT" />
        <LabelGroup items={props.frontmatter.pedestre} icon={<Marcheur />} color="#ece" tooltip="Marche" />
        <LabelGroup items={props.frontmatter.inscriptions} tooltip="Inscription" />
      </div>
    </Styled.Event>
  );
};

const EventList = ({ events }) => (
  <div>
    {events.reduce((acc, node) => {
      const prepend = [];

      if (node.newMonth) {
        prepend.push(<MonthTitle key={node.frontmatter.month} month={moment(node.frontmatter.date).format('MMMM YYYY')} />);
      }

      return [
        ...acc,
        ...prepend,
        <Event key={node.frontmatter.title} {...node} />,
      ];
    }, [])}
  </div>
);

const Legende = () => (
  <Styled.Legende>
    <LabelGroup items={['Départ']} tooltip="Départ" />
    <LabelGroup items={['VTT']} icon={<Cycliste />} color="#aaf" tooltip="VTT" />
    <LabelGroup items={['Marche']} icon={<Marcheur />} color="#ece" tooltip="Marche" />
    <LabelGroup items={['Trail']} icon={<Coureur />} color="#ec8" tooltip="Trail / Cross" />
    <LabelGroup items={['Inscription']} tooltip="Inscription" />
  </Styled.Legende>
);

const AgendaIndex = props => {
  const siteTitle = get(props, 'data.site.siteMetadata.title');

  const events = get(props, 'data.allMarkdownRemark.edges')
    .map(({ node }, index, full) => {
      const previous = full[index - 1] && full[index - 1].node;
      return {
        ...node,
        newMonth: !previous || previous.frontmatter.month !== node.frontmatter.month,
        newDay: !previous || previous.frontmatter.day !== node.frontmatter.day,
      };
    });

  return (
    <div>
      <Helmet title={siteTitle} />
      <Intro />
      <Legende />
      <EventList events={events} />
    </div>
  );
};

export default AgendaIndex;

export const pageQuery = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: ASC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            month: date(formatString: "YYYY-MM")
            day: date(formatString: "YYYY-MM-DD")
            date
            title
            distances
            inscriptions
            distances
            commune
            departement
            pedestre
          }
        }
      }
    }
  }
`;
