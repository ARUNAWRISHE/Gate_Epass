"""Mail_status Column added

Revision ID: 293b694660cd
Revises: 78727a33a228
Create Date: 2025-02-13 12:28:37.213828

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '293b694660cd'
down_revision = '78727a33a228'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('request', schema=None) as batch_op:
        batch_op.add_column(sa.Column('appreciation_letter', sa.String(300), nullable=True))

def downgrade():
    with op.batch_alter_table('request', schema=None) as batch_op:
        batch_op.drop_column('appreciation_letter')


    # ### end Alembic commands ###
